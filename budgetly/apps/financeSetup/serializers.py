"""
apps/financeSetup/serializers.py

Serializers for financial profile data collection, validation,
and analytics-ready output used by the RAG pipeline.
"""

from rest_framework import serializers
from .models import FinancialProfile, CustomCategory, OnboardingSession
from decimal import Decimal


# ── Helper ────────────────────────────────────────────────────────────────────

def _non_negative(value):
    if value is not None and value < 0:
        raise serializers.ValidationError("Amount cannot be negative.")
    return value


# ── Custom Category ───────────────────────────────────────────────────────────

class CustomCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomCategory
        fields = ["id", "name", "monthly_amount"]

    def validate_monthly_amount(self, value):
        return _non_negative(value)

    def validate_name(self, value):
        return value.strip().title()


# ── Step serializers (partial updates per onboarding step) ───────────────────

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialProfile
        fields = ["monthly_salary", "monthly_side_income"]

    def validate_monthly_salary(self, v): return _non_negative(v)
    def validate_monthly_side_income(self, v): return _non_negative(v)


class SpendingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialProfile
        fields = [
            "spending_food_dining",
            "spending_entertainment",
            "spending_transport",
            "spending_subscriptions",
            "spending_housing",
        ]

    def validate_spending_food_dining(self, v): return _non_negative(v)
    def validate_spending_entertainment(self, v): return _non_negative(v)
    def validate_spending_transport(self, v): return _non_negative(v)
    def validate_spending_subscriptions(self, v): return _non_negative(v)
    def validate_spending_housing(self, v): return _non_negative(v)


class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialProfile
        fields = ["total_debts"]

    def validate_total_debts(self, v): return _non_negative(v)


class SavingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialProfile
        fields = ["emergency_fund", "total_savings"]

    def validate_emergency_fund(self, v): return _non_negative(v)
    def validate_total_savings(self, v): return _non_negative(v)


class InvestmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialProfile
        fields = ["total_investments"]

    def validate_total_investments(self, v): return _non_negative(v)


class AccountBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialProfile
        fields = ["current_account_balance"]


# ── Full profile (read) ───────────────────────────────────────────────────────

class FinancialProfileSerializer(serializers.ModelSerializer):
    custom_categories = CustomCategorySerializer(many=True, read_only=True)
    total_monthly_income = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True
    )
    total_monthly_spending = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True
    )
    monthly_surplus = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True
    )
    missing_fields = serializers.DictField(read_only=True)

    class Meta:
        model = FinancialProfile
        fields = [
            "id",
            "status",
            "monthly_salary",
            "monthly_side_income",
            "spending_food_dining",
            "spending_entertainment",
            "spending_transport",
            "spending_subscriptions",
            "spending_housing",
            "total_debts",
            "emergency_fund",
            "total_savings",
            "total_investments",
            "current_account_balance",
            "statement_parsed",
            "custom_categories",
            # computed
            "total_monthly_income",
            "total_monthly_spending",
            "monthly_surplus",
            "missing_fields",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "statement_parsed", "created_at", "updated_at"]


# ── Onboarding session ────────────────────────────────────────────────────────

class OnboardingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingSession
        fields = ["current_step", "completed_steps", "prefilled_from_upload", "updated_at"]


# ── Analytics-ready RAG document (used by AI service) ────────────────────────

class FinancialRAGDocumentSerializer(serializers.ModelSerializer):
    """
    Flat, human-readable representation of a user's finances.
    Used to generate text chunks for RAG embeddings.
    """
    custom_categories = CustomCategorySerializer(many=True, read_only=True)
    total_monthly_income = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    total_monthly_spending = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    monthly_surplus = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = FinancialProfile
        fields = [
            "monthly_salary",
            "monthly_side_income",
            "total_monthly_income",
            "spending_food_dining",
            "spending_entertainment",
            "spending_transport",
            "spending_subscriptions",
            "spending_housing",
            "total_monthly_spending",
            "monthly_surplus",
            "total_debts",
            "emergency_fund",
            "total_savings",
            "total_investments",
            "current_account_balance",
            "custom_categories",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        cats = data.pop("custom_categories", [])
        data["custom_categories"] = {
            c["name"]: str(c["monthly_amount"]) for c in cats if c["monthly_amount"]
        }
        return data