"""
apps/financeSetup/models.py

Structured financial data model for RAG/AI pipeline.
All monetary fields are stored as Decimal for precision.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal

from django.utils import timezone


class FinancialProfile(models.Model):
    """
    Core financial profile for a user.
    One profile per user; updated incrementally during onboarding.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),           # onboarding in progress
        ("complete", "Complete"),     # onboarding finished
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="financial_profile",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # ── Income ────────────────────────────────────────────────────────────────
    monthly_salary = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )
    monthly_side_income = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )

    # ── Monthly Spending ──────────────────────────────────────────────────────
    spending_food_dining = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )
    spending_entertainment = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )
    spending_transport = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )
    spending_subscriptions = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )
    spending_housing = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )

    # ── Debts & Loans ─────────────────────────────────────────────────────────
    total_debts = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )

    # ── Savings ───────────────────────────────────────────────────────────────
    emergency_fund = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )
    total_savings = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )

    # ── Investments ───────────────────────────────────────────────────────────
    total_investments = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )

    # ── Account Balance ───────────────────────────────────────────────────────
    current_account_balance = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True,
    )

    # ── Upload ────────────────────────────────────────────────────────────────
    uploaded_statement = models.FileField(
        upload_to="statements/%Y/%m/", null=True, blank=True
    )
    statement_parsed = models.BooleanField(default=False)

    # ── Meta ──────────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Financial Profile"

    def __str__(self):
        return f"FinancialProfile({self.user_id}, {self.status})"

    # ── Computed helpers (used by serializer & RAG service) ──────────────────
    @property
    def total_monthly_income(self):
        return (self.monthly_salary or 0) + (self.monthly_side_income or 0)

    @property
    def total_monthly_spending(self):
        fields = [
            self.spending_food_dining,
            self.spending_entertainment,
            self.spending_transport,
            self.spending_subscriptions,
            self.spending_housing,
        ]
        return sum(f for f in fields if f is not None)

    @property
    def monthly_surplus(self):
        return self.total_monthly_income - self.total_monthly_spending

    @property
    def missing_fields(self):
        """Returns a list of required field names that have not been filled."""
        required = {
            "monthly_salary": "Monthly Salary",
            "spending_food_dining": "Food & Dining",
            "spending_entertainment": "Entertainment",
            "spending_transport": "Transport",
            "spending_subscriptions": "Subscriptions",
            "spending_housing": "Housing Expenses",
            "total_debts": "Total Debts",
            "emergency_fund": "Emergency Fund",
            "total_savings": "Total Savings",
            "total_investments": "Investments",
            "current_account_balance": "Account Balance",
        }
        return {k: v for k, v in required.items() if getattr(self, k) is None}


class CustomCategory(models.Model):
    """User-defined spending categories for flexible RAG context."""

    profile = models.ForeignKey(
        FinancialProfile,
        on_delete=models.CASCADE,
        related_name="custom_categories",
    )
    name = models.CharField(max_length=100)
    monthly_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0"))]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("profile", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} – {self.monthly_amount}"


class OnboardingSession(models.Model):
    """
    Tracks which onboarding step the user is on.
    Allows resuming a partially completed flow.
    """

    STEP_CHOICES = [
        ("intro", "Intro"),
        ("income", "Income"),
        ("spending", "Spending"),
        ("debts", "Debts"),
        ("savings", "Savings"),
        ("investments", "Investments"),
        ("balance", "Account Balance"),
        ("extra", "Extra Categories"),
        ("complete", "Complete"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="onboarding_session",
    )
    current_step = models.CharField(max_length=20, choices=STEP_CHOICES, default="intro")
    completed_steps = models.JSONField(default=list)  # ["income", "spending", ...]
    prefilled_from_upload = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def mark_step_complete(self, step: str):
        if step not in self.completed_steps:
            self.completed_steps.append(step)
            self.save(update_fields=["completed_steps", "updated_at"])

    def __str__(self):
        return f"OnboardingSession({self.user_id}, step={self.current_step})"



#  Dashboard models Addition :


class Transaction(models.Model):
    """Individual dated transaction, parsed from an uploaded statement."""

    profile = models.ForeignKey(
        FinancialProfile, on_delete=models.CASCADE, related_name="transactions"
    )
    date = models.DateField()
    description = models.CharField(max_length=255)
    # Negative = money out (spend), positive = money in (income)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=40, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        indexes = [models.Index(fields=["profile", "date"])]

    def __str__(self):
        return f"{self.date} | {self.description} | {self.amount}"


class BalanceSnapshot(models.Model):
    """One balance reading per day, so the dashboard can plot a real trend."""

    profile = models.ForeignKey(
        FinancialProfile, on_delete=models.CASCADE, related_name="balance_snapshots"
    )
    balance = models.DecimalField(max_digits=14, decimal_places=2)
    recorded_at = models.DateField(default=timezone.now)

    class Meta:
        ordering = ["recorded_at"]
        unique_together = ("profile", "recorded_at")

    def __str__(self):
        return f"{self.recorded_at}: {self.balance}"