"""
apps/financeSetup/services.py

Business logic layer:
  - PDF / CSV statement parsing
  - Financial data normalization
  - Missing field detection
  - RAG document text generation
"""

import csv
import io
import re
import logging
from decimal import Decimal, InvalidOperation
from typing import Optional
from datetime import datetime, date as date_cls

logger = logging.getLogger(__name__)


# ── Currency normalization ────────────────────────────────────────────────────

def parse_amount(raw: str) -> Optional[Decimal]:
    """
    Convert a raw string like '$1,234.56' or '1234' or '(500)' into Decimal.
    Returns None if unparseable.
    """
    if not raw:
        return None
    raw = str(raw).strip()
    # Remove currency symbols, spaces, commas
    cleaned = re.sub(r"[^\d.\-\(\)]", "", raw)
    # Handle accounting notation (500) → -500
    if cleaned.startswith("(") and cleaned.endswith(")"):
        cleaned = "-" + cleaned[1:-1]
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


# ── Category keyword mapping ──────────────────────────────────────────────────

CATEGORY_KEYWORDS = {
    "spending_food_dining": [
        "restaurant", "cafe", "food", "dining", "pizza", "burger",
        "grocery", "supermarket", "meal", "breakfast", "lunch", "dinner",
        "takeaway", "delivery", "doordash", "ubereats",
    ],
    "spending_entertainment": [
        "cinema", "movie", "theatre", "concert", "gaming", "game", "netflix",
        "spotify", "entertainment", "bowling", "park", "event",
    ],
    "spending_transport": [
        "uber", "lyft", "taxi", "fuel", "petrol", "gas station",
        "parking", "transit", "bus", "train", "metro", "toll", "car",
    ],
    "spending_subscriptions": [
        "subscription", "monthly plan", "apple", "google play", "amazon prime",
        "hulu", "disney", "membership", "renewal", "recurring",
    ],
    "spending_housing": [
        "rent", "mortgage", "landlord", "property", "utility", "electricity",
        "water", "internet", "broadband", "gas bill", "insurance",
    ],
    "total_debts": [
        "loan", "credit card", "repayment", "emi", "installment", "debt",
        "finance charge", "interest payment",
    ],
    "total_savings": [
        "savings", "saving deposit", "piggy", "put aside",
    ],
    "total_investments": [
        "investment", "stock", "shares", "etf", "mutual fund", "crypto",
        "brokerage", "dividend", "401k", "ira",
    ],
    "monthly_salary": [
        "salary", "payroll", "wages", "direct deposit", "income", "paycheck",
    ],
    "monthly_side_income": [
        "freelance", "side income", "consulting", "contract payment", "gig",
    ],
    "current_account_balance": [
        "closing balance", "available balance", "account balance", "balance forward",
    ],
}


def classify_transaction(description: str) -> Optional[str]:
    """Map a transaction description to a financial profile field."""
    desc_lower = description.lower()
    for field, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return field
    return None


# ── PDF Parsing ───────────────────────────────────────────────────────────────

def parse_pdf_statement(file_bytes: bytes) -> dict:
    """
    Extract financial data from a PDF bank statement.
    Uses pdfminer (text-based PDFs). Returns a dict of field → Decimal.
    """
    try:
        from pdfminer.high_level import extract_text_to_fp
        from pdfminer.layout import LAParams
        import pdfminer

        output = io.StringIO()
        extract_text_to_fp(
            io.BytesIO(file_bytes),
            output,
            laparams=LAParams(),
            output_type="text",
            codec="utf-8",
        )
        text = output.getvalue()
        return _extract_from_text(text)

    except ImportError:
        logger.warning("pdfminer not installed — skipping PDF parse")
        return {}
    except Exception as e:
        logger.error(f"PDF parse error: {e}")
        return {}


def _extract_from_text(text: str) -> dict:
    results: dict[str, list[Decimal]] = {}
    transactions: list[dict] = []
    today = timezone.now().date()

    line_pattern = re.compile(
        r"(?P<desc>[A-Za-z][\w\s\-/&*',.]{2,60}?)\s+"
        r"(?P<sign>-|\+)?\s*\$?\s*(?P<amount>[\d,]+\.?\d{0,2})",
        re.IGNORECASE,
    )

    for raw_line in text.splitlines():
        match = line_pattern.search(raw_line)
        if not match:
            continue
        desc = match.group("desc").strip()
        sign = match.group("sign") or "+"
        raw_amount = match.group("amount").replace(",", "")
        amount = parse_amount(raw_amount)
        if amount is None or amount == 0:
            continue
        if sign == "-":
            amount = -amount

        field = classify_transaction(desc)
        if field:
            results.setdefault(field, []).append(amount)

        txn_date = extract_date(raw_line, fallback=today)
        is_spend_field = field not in (
            "monthly_salary", "monthly_side_income", "current_account_balance", None,
        )
        transactions.append({
            "date": txn_date,
            "description": desc,
            "amount": -abs(amount) if is_spend_field else amount,
            "category": field,
        })

    aggregated: dict[str, Decimal] = {}
    for field, amounts in results.items():
        if field in ("monthly_salary", "monthly_side_income", "current_account_balance"):
            aggregated[field] = sum(amounts)
        else:
            aggregated[field] = sum(abs(a) for a in amounts)

    balance_pattern = re.compile(
        r"(?:closing|available|account)\s+balance[:\s]+\$?\s*([\d,]+\.?\d{0,2})",
        re.IGNORECASE,
    )
    balance_match = balance_pattern.search(text)
    if balance_match:
        bal = parse_amount(balance_match.group(1))
        if bal:
            aggregated["current_account_balance"] = bal

    return {"aggregated": aggregated, "transactions": transactions}


# ── CSV Parsing ───────────────────────────────────────────────────────────────

def parse_csv_statement(file_bytes: bytes) -> dict:
    try:
        text = file_bytes.decode("utf-8", errors="replace")
        reader = csv.DictReader(io.StringIO(text))

        results: dict[str, list[Decimal]] = {}
        transactions: list[dict] = []
        today = timezone.now().date()

        for row in reader:
            row_lower = {k.lower().strip(): v for k, v in row.items() if k}

            desc = (
                row_lower.get("description") or row_lower.get("memo")
                or row_lower.get("narration") or row_lower.get("details") or ""
            )

            raw_amount = row_lower.get("amount") or row_lower.get("transaction amount") or ""
            if not raw_amount:
                debit = parse_amount(row_lower.get("debit", "") or "0") or Decimal("0")
                credit = parse_amount(row_lower.get("credit", "") or "0") or Decimal("0")
                amount = credit - debit
            else:
                amount = parse_amount(raw_amount)

            if amount is None:
                continue

            raw_date = row_lower.get("date") or row_lower.get("transaction date") or ""
            txn_date = extract_date(raw_date, fallback=today) if raw_date else today

            field = classify_transaction(desc)
            if field:
                results.setdefault(field, []).append(amount)

            is_spend_field = field not in (
                "monthly_salary", "monthly_side_income", "current_account_balance", None,
            )
            transactions.append({
                "date": txn_date,
                "description": desc,
                "amount": -abs(amount) if is_spend_field else amount,
                "category": field,
            })

        aggregated: dict[str, Decimal] = {}
        for field, amounts in results.items():
            if field in ("monthly_salary", "monthly_side_income", "current_account_balance"):
                aggregated[field] = sum(amounts)
            else:
                aggregated[field] = sum(abs(a) for a in amounts)

        return {"aggregated": aggregated, "transactions": transactions}

    except Exception as e:
        logger.error(f"CSV parse error: {e}")
        return {"aggregated": {}, "transactions": []}

    
# ── Main entry point ──────────────────────────────────────────────────────────

def parse_statement(file, filename: str) -> dict:
    """
    Dispatch to PDF or CSV parser based on file extension.
    Returns a dict of FinancialProfile field names → Decimal values.
    """
    content = file.read()
    file.seek(0)

    name_lower = filename.lower()
    if name_lower.endswith(".pdf"):
        return parse_pdf_statement(content)
    elif name_lower.endswith(".csv"):
        return parse_csv_statement(content)

    return {}

def apply_parsed_data(profile, parsed: dict) -> list[str]:
    aggregated = parsed.get("aggregated", {})
    transactions = parsed.get("transactions", [])

    filled = []
    for field, value in aggregated.items():
        if hasattr(profile, field) and getattr(profile, field) is None and value:
            setattr(profile, field, value)
            filled.append(field)

    if filled:
        profile.statement_parsed = True
        profile.save()

    if transactions:
        from .models import Transaction
        Transaction.objects.bulk_create([
            Transaction(
                profile=profile,
                date=t["date"],
                description=t["description"][:255],
                amount=t["amount"],
                category=t["category"],
            )
            for t in transactions
        ])

    return filled

# ── Missing fields helper ─────────────────────────────────────────────────────

def get_missing_fields(profile) -> dict:
    """Return human-readable labels for fields still missing from the profile."""
    return profile.missing_fields


# ── RAG document generation ───────────────────────────────────────────────────

def generate_rag_text(profile) -> str:
    """
    Convert a FinancialProfile into a structured text document
    suitable for RAG embedding / retrieval.
    """
    def fmt(val):
        return f"${val:,.2f}" if val is not None else "not provided"

    cats = profile.custom_categories.all()
    custom_str = ""
    if cats:
        custom_str = "\nCustom categories:\n" + "\n".join(
            f"  - {c.name}: {fmt(c.monthly_amount)}/month" for c in cats
        )

    text = f"""
Financial Profile Summary

INCOME
  Monthly salary:       {fmt(profile.monthly_salary)}
  Side / other income:  {fmt(profile.monthly_side_income)}
  Total monthly income: {fmt(profile.total_monthly_income)}

MONTHLY SPENDING
  Food & Dining:        {fmt(profile.spending_food_dining)}
  Entertainment:        {fmt(profile.spending_entertainment)}
  Transport:            {fmt(profile.spending_transport)}
  Subscriptions:        {fmt(profile.spending_subscriptions)}
  Housing Expenses:     {fmt(profile.spending_housing)}
  Total spending:       {fmt(profile.total_monthly_spending)}

NET SURPLUS / DEFICIT
  Monthly surplus:      {fmt(profile.monthly_surplus)}

DEBTS & LOANS
  Total debts:          {fmt(profile.total_debts)}

SAVINGS
  Emergency fund:       {fmt(profile.emergency_fund)}
  Total savings:        {fmt(profile.total_savings)}

INVESTMENTS
  Total investments:    {fmt(profile.total_investments)}

ACCOUNT BALANCE
  Current balance:      {fmt(profile.current_account_balance)}
{custom_str}
""".strip()

    return text


#  DASHBOARD SERVICES ------------

DATE_PATTERNS = [
    (re.compile(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b"), "%Y-%m-%d"),
    (re.compile(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b"), "%m/%d/%Y"),
    (re.compile(r"\b(\d{1,2})/(\d{1,2})/(\d{2})\b"), "%m/%d/%y"),
    (re.compile(r"\b(\d{1,2})-(\d{1,2})-(\d{4})\b"), "%m-%d-%Y"),
]

def extract_date(line: str, fallback: date_cls) -> date_cls:
    """Best-effort date extraction from a statement line. Falls back to
    the given date (e.g. upload date) when no recognizable date is found."""
    for pattern, fmt in DATE_PATTERNS:
        m = pattern.search(line)
        if m:
            try:
                return datetime.strptime(m.group(0), fmt).date()
            except ValueError:
                continue
    return fallback



# dashboard agression

from collections import defaultdict
from datetime import timedelta
from django.utils import timezone

CATEGORY_LABELS = {
    "spending_food_dining": "Food & Dining",
    "spending_entertainment": "Entertainment",
    "spending_transport": "Transport",
    "spending_subscriptions": "Subscriptions",
    "spending_housing": "Housing",
}
CHART_COLORS = ["#b0bafb", "#9ba7f9", "#e6e9fe", "#d1d5db", "#f4c7c3", "#a8dadc"]


def get_dashboard_data(profile) -> dict:
    today = timezone.now().date()
    week_start = today - timedelta(days=6)
    prev_week_start = week_start - timedelta(days=7)

    week_txns = list(profile.transactions.filter(date__gte=week_start, date__lte=today))
    prev_week_txns = list(
        profile.transactions.filter(date__gte=prev_week_start, date__lt=week_start)
    )

    # ── Weekly spending bar chart ──────────────────────────────────────
    by_day: dict = defaultdict(Decimal)
    for t in week_txns:
        if t.amount < 0:
            by_day[t.date] += abs(t.amount)

    weekly_spending = []
    for i in range(7):
        d = week_start + timedelta(days=i)
        weekly_spending.append({"name": d.strftime("%a"), "spend": float(by_day.get(d, 0))})

    week_total = sum(d["spend"] for d in weekly_spending)
    prev_week_total = float(sum(abs(t.amount) for t in prev_week_txns if t.amount < 0))
    week_change_pct = (
        round(((week_total - prev_week_total) / prev_week_total) * 100, 1)
        if prev_week_total > 0 else None
    )

    # ── Category pie chart (from onboarding aggregates + custom cats) ─
    pie_data = []
    for i, (field, label) in enumerate(CATEGORY_LABELS.items()):
        val = getattr(profile, field) or Decimal("0")
        if val:
            pie_data.append({
                "name": label, "value": float(val),
                "color": CHART_COLORS[i % len(CHART_COLORS)],
            })
    for j, cat in enumerate(profile.custom_categories.all()):
        if cat.monthly_amount:
            pie_data.append({
                "name": cat.name, "value": float(cat.monthly_amount),
                "color": CHART_COLORS[(len(CATEGORY_LABELS) + j) % len(CHART_COLORS)],
            })

    # ── Balance trend line chart ───────────────────────────────────────
    snapshots = list(profile.balance_snapshots.order_by("recorded_at"))
    balance_trend = [
        {"name": s.recorded_at.strftime("%b %d"), "balance": float(s.balance)}
        for s in snapshots[-12:]
    ]
    balance_change_pct = None
    if len(snapshots) >= 2:
        first, last = float(snapshots[0].balance), float(snapshots[-1].balance)
        if first != 0:
            balance_change_pct = round(((last - first) / abs(first)) * 100, 1)

    # ── Insights ────────────────────────────────────────────────────────
    insights = []

    dining_this_week = float(
        sum(abs(t.amount) for t in week_txns if t.category == "spending_food_dining" and t.amount < 0)
    )
    if profile.spending_food_dining:
        avg_weekly_dining = float(profile.spending_food_dining) / 4.33
        if avg_weekly_dining > 0 and dining_this_week > avg_weekly_dining * 1.2:
            pct = round((dining_this_week / avg_weekly_dining - 1) * 100)
            insights.append({
                "type": "alert", "title": "Overspending Alert",
                "message": f"You've spent {pct}% more on Food & Dining this week than your average.",
            })

    if profile.monthly_surplus and profile.monthly_surplus > 0:
        insights.append({
            "type": "recommendation", "title": "Recommendation",
            "message": f"You have a monthly surplus of Rs {profile.monthly_surplus:,.2f}. Consider moving it to savings.",
        })

    if profile.spending_subscriptions:
        insights.append({
            "type": "waste", "title": "Subscriptions",
            "message": f"You're spending Rs {profile.spending_subscriptions:,.2f}/month on subscriptions. Review for unused ones.",
        })

    return {
        "metrics": {
            "total_balance": float(profile.current_account_balance or 0),
            "monthly_spending": float(profile.total_monthly_spending or 0),
            "total_savings": float(profile.total_savings or 0),
            "balance_change_pct": balance_change_pct,
            "spending_change_pct": week_change_pct,
        },
        "pie_data": pie_data,
        "weekly_spending": weekly_spending,
        "balance_trend": balance_trend,
        "insights": insights,
    }