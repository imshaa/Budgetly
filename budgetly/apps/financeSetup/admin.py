"""
apps/financeSetup/admin.py
"""

from django.contrib import admin
from .models import FinancialProfile, CustomCategory, OnboardingSession


class CustomCategoryInline(admin.TabularInline):
    model = CustomCategory
    extra = 0
    fields = ("name", "monthly_amount")


@admin.register(FinancialProfile)
class FinancialProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "status",
        "total_monthly_income",
        "total_monthly_spending",
        "monthly_surplus",
        "statement_parsed",
        "updated_at",
    )
    list_filter = ("status", "statement_parsed")
    search_fields = ("user__email",)
    readonly_fields = (
        "total_monthly_income",
        "total_monthly_spending",
        "monthly_surplus",
        "created_at",
        "updated_at",
    )
    inlines = [CustomCategoryInline]


@admin.register(OnboardingSession)
class OnboardingSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "current_step", "prefilled_from_upload", "updated_at")
    list_filter = ("current_step",)
    search_fields = ("user__email",)