"""
apps/financeSetup/urls.py
"""

from django.urls import path
from .views import (
    UploadStatementView,
    FinancialProfileView,
    IncomeView,
    SpendingView,
    DebtsView,
    SavingsView,
    InvestmentsView,
    AccountBalanceView,
    CustomCategoryView,
    CompleteOnboardingView,
    OnboardingSessionView,
)

urlpatterns = [
    # Onboarding session state (for resume support)
    path("session/", OnboardingSessionView.as_view(), name="finance-session"),

    # Full profile read
    path("profile/", FinancialProfileView.as_view(), name="finance-profile"),

    # Statement upload (auto-fill)
    path("upload/", UploadStatementView.as_view(), name="finance-upload"),

    # Step-by-step data collection
    path("income/", IncomeView.as_view(), name="finance-income"),
    path("spending/", SpendingView.as_view(), name="finance-spending"),
    path("debts/", DebtsView.as_view(), name="finance-debts"),
    path("savings/", SavingsView.as_view(), name="finance-savings"),
    path("investments/", InvestmentsView.as_view(), name="finance-investments"),
    path("balance/", AccountBalanceView.as_view(), name="finance-balance"),

    # Custom categories
    path("categories/", CustomCategoryView.as_view(), name="finance-categories"),
    path("categories/<int:category_id>/", CustomCategoryView.as_view(), name="finance-category-delete"),

    # Finalise
    path("complete/", CompleteOnboardingView.as_view(), name="finance-complete"),
]