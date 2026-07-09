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
    """
    Scan raw text for monetary patterns and classify them into financial fields.
    Returns accumulated totals per field (income lines summed, etc.).
    """
    results: dict[str, list[Decimal]] = {}

    # Match lines like: "Salary          $3,500.00" or "NETFLIX    -$12.99"
    line_pattern = re.compile(
        r"(?P<desc>[A-Za-z][\w\s\-/&*',.]{2,60}?)\s+"
        r"(?P<sign>-|\+)?\s*\$?\s*(?P<amount>[\d,]+\.?\d{0,2})",
        re.IGNORECASE,
    )

    for match in line_pattern.finditer(text):
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

    # Aggregate: income = sum of positives, spending = sum of absolute values
    aggregated: dict[str, Decimal] = {}
    for field, amounts in results.items():
        if field in ("monthly_salary", "monthly_side_income", "current_account_balance"):
            aggregated[field] = sum(amounts)
        else:
            aggregated[field] = sum(abs(a) for a in amounts)

    # Remove nonsense aggregations (e.g., current_balance should be last value)
    # Re-extract closing balance from dedicated patterns
    balance_pattern = re.compile(
        r"(?:closing|available|account)\s+balance[:\s]+\$?\s*([\d,]+\.?\d{0,2})",
        re.IGNORECASE,
    )
    balance_match = balance_pattern.search(text)
    if balance_match:
        bal = parse_amount(balance_match.group(1))
        if bal:
            aggregated["current_account_balance"] = bal

    return aggregated


# ── CSV Parsing ───────────────────────────────────────────────────────────────

def parse_csv_statement(file_bytes: bytes) -> dict:
    """
    Parse a CSV bank statement export.
    Expects columns like: Date, Description, Amount (or Debit/Credit).
    Returns a dict of field → Decimal.
    """
    try:
        text = file_bytes.decode("utf-8", errors="replace")
        reader = csv.DictReader(io.StringIO(text))

        results: dict[str, list[Decimal]] = {}

        for row in reader:
            # Normalize column names
            row_lower = {k.lower().strip(): v for k, v in row.items() if k}

            desc = (
                row_lower.get("description")
                or row_lower.get("memo")
                or row_lower.get("narration")
                or row_lower.get("details")
                or ""
            )

            # Try Amount first, then Debit/Credit split
            raw_amount = row_lower.get("amount") or row_lower.get("transaction amount") or ""
            if not raw_amount:
                debit = parse_amount(row_lower.get("debit", "") or "0") or Decimal("0")
                credit = parse_amount(row_lower.get("credit", "") or "0") or Decimal("0")
                amount = credit - debit
            else:
                amount = parse_amount(raw_amount)

            if amount is None:
                continue

            field = classify_transaction(desc)
            if field:
                results.setdefault(field, []).append(amount)

        aggregated: dict[str, Decimal] = {}
        for field, amounts in results.items():
            if field in ("monthly_salary", "monthly_side_income", "current_account_balance"):
                aggregated[field] = sum(amounts)
            else:
                aggregated[field] = sum(abs(a) for a in amounts)

        return aggregated

    except Exception as e:
        logger.error(f"CSV parse error: {e}")
        return {}


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
    """
    Apply parsed statement data to a FinancialProfile.
    Only fills fields that are currently None (don't overwrite user entries).
    Returns list of fields that were pre-filled.
    """
    filled = []
    for field, value in parsed.items():
        if hasattr(profile, field) and getattr(profile, field) is None and value:
            setattr(profile, field, value)
            filled.append(field)

    if filled:
        profile.statement_parsed = True
        profile.save()

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