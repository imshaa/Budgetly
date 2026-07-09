"""
apps/financeSetup/views.py

REST API for the conversational financial onboarding flow.

Endpoints:
  POST   /api/finance/upload/            — upload PDF/CSV statement
  GET    /api/finance/profile/           — get current profile + missing fields
  PATCH  /api/finance/income/            — save income step
  PATCH  /api/finance/spending/          — save spending step
  PATCH  /api/finance/debts/             — save debts step
  PATCH  /api/finance/savings/           — save savings step
  PATCH  /api/finance/investments/       — save investments step
  PATCH  /api/finance/balance/           — save account balance step
  POST   /api/finance/categories/        — add custom category
  DELETE /api/finance/categories/<id>/   — remove custom category
  POST   /api/finance/complete/          — finalise onboarding
  GET    /api/finance/session/           — get onboarding session state
"""

import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated

from .models import FinancialProfile, CustomCategory, OnboardingSession
from .serializers import (
    FinancialProfileSerializer,
    IncomeSerializer,
    SpendingSerializer,
    DebtSerializer,
    SavingsSerializer,
    InvestmentsSerializer,
    AccountBalanceSerializer,
    CustomCategorySerializer,
    OnboardingSessionSerializer,
)
from .services import parse_statement, apply_parsed_data, get_missing_fields, generate_rag_text

logger = logging.getLogger(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_or_create_profile(user):
    profile, _ = FinancialProfile.objects.get_or_create(user=user)
    return profile


def _get_or_create_session(user):
    session, _ = OnboardingSession.objects.get_or_create(user=user)
    return session


def _patch_profile(profile, serializer_class, data):
    """Partial update helper. Returns (serializer, error_response | None)."""
    ser = serializer_class(profile, data=data, partial=True)
    if not ser.is_valid():
        return ser, Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    ser.save()
    return ser, None


# ── Views ─────────────────────────────────────────────────────────────────────

class UploadStatementView(APIView):
    """
    POST /api/finance/upload/
    Accepts a PDF or CSV bank statement, parses it, pre-fills the profile,
    and returns which fields were populated and which are still missing.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("statement")
        if not file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        allowed_types = ["application/pdf", "text/csv", "application/vnd.ms-excel"]
        if (
            file.content_type not in allowed_types
            and not file.name.lower().endswith((".pdf", ".csv"))
        ):
            return Response(
                {"error": "Only PDF or CSV files are accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = _get_or_create_profile(request.user)
        session = _get_or_create_session(request.user)

        # Save file reference
        profile.uploaded_statement = file
        profile.save(update_fields=["uploaded_statement"])

        # Parse and apply
        parsed = parse_statement(file, file.name)
        filled_fields = apply_parsed_data(profile, parsed)

        profile.refresh_from_db()
        missing = get_missing_fields(profile)

        session.prefilled_from_upload = True
        session.mark_step_complete("upload")

        return Response(
            {
                "prefilled_fields": filled_fields,
                "missing_fields": missing,
                "profile": FinancialProfileSerializer(profile).data,
                "message": (
                    f"Extracted {len(filled_fields)} fields from your statement. "
                    f"{len(missing)} field(s) still need your input."
                    if filled_fields
                    else "Could not auto-detect financial data. Please fill in manually."
                ),
            },
            status=status.HTTP_200_OK,
        )


class FinancialProfileView(APIView):
    """
    GET /api/finance/profile/
    Returns the user's full financial profile with missing fields.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_or_create_profile(request.user)
        session = _get_or_create_session(request.user)
        return Response(
            {
                "profile": FinancialProfileSerializer(profile).data,
                "session": OnboardingSessionSerializer(session).data,
            }
        )


class IncomeView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile = _get_or_create_profile(request.user)
        _, err = _patch_profile(profile, IncomeSerializer, request.data)
        if err:
            return err
        session = _get_or_create_session(request.user)
        session.mark_step_complete("income")
        session.current_step = "spending"
        session.save(update_fields=["current_step", "updated_at"])
        return Response({"message": "Income saved.", "profile": FinancialProfileSerializer(profile).data})


class SpendingView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile = _get_or_create_profile(request.user)
        _, err = _patch_profile(profile, SpendingSerializer, request.data)
        if err:
            return err
        session = _get_or_create_session(request.user)
        session.mark_step_complete("spending")
        session.current_step = "debts"
        session.save(update_fields=["current_step", "updated_at"])
        return Response({"message": "Spending saved.", "profile": FinancialProfileSerializer(profile).data})


class DebtsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile = _get_or_create_profile(request.user)
        _, err = _patch_profile(profile, DebtSerializer, request.data)
        if err:
            return err
        session = _get_or_create_session(request.user)
        session.mark_step_complete("debts")
        session.current_step = "savings"
        session.save(update_fields=["current_step", "updated_at"])
        return Response({"message": "Debts saved.", "profile": FinancialProfileSerializer(profile).data})


class SavingsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile = _get_or_create_profile(request.user)
        _, err = _patch_profile(profile, SavingsSerializer, request.data)
        if err:
            return err
        session = _get_or_create_session(request.user)
        session.mark_step_complete("savings")
        session.current_step = "investments"
        session.save(update_fields=["current_step", "updated_at"])
        return Response({"message": "Savings saved.", "profile": FinancialProfileSerializer(profile).data})


class InvestmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile = _get_or_create_profile(request.user)
        _, err = _patch_profile(profile, InvestmentsSerializer, request.data)
        if err:
            return err
        session = _get_or_create_session(request.user)
        session.mark_step_complete("investments")
        session.current_step = "balance"
        session.save(update_fields=["current_step", "updated_at"])
        return Response({"message": "Investments saved.", "profile": FinancialProfileSerializer(profile).data})


class AccountBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile = _get_or_create_profile(request.user)
        _, err = _patch_profile(profile, AccountBalanceSerializer, request.data)
        if err:
            return err
        session = _get_or_create_session(request.user)
        session.mark_step_complete("balance")
        session.current_step = "extra"
        session.save(update_fields=["current_step", "updated_at"])
        return Response({"message": "Account balance saved.", "profile": FinancialProfileSerializer(profile).data})


class CustomCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = _get_or_create_profile(request.user)
        ser = CustomCategorySerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate names
        name = ser.validated_data["name"]
        if profile.custom_categories.filter(name__iexact=name).exists():
            return Response(
                {"error": f"Category '{name}' already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category = ser.save(profile=profile)
        return Response(CustomCategorySerializer(category).data, status=status.HTTP_201_CREATED)

    def delete(self, request, category_id):
        profile = _get_or_create_profile(request.user)
        try:
            cat = profile.custom_categories.get(id=category_id)
        except CustomCategory.DoesNotExist:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        cat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CompleteOnboardingView(APIView):
    """
    POST /api/finance/complete/
    Marks onboarding as complete. Generates RAG text document (logged for now;
    your RAG pipeline can pick it up from here).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = _get_or_create_profile(request.user)
        session = _get_or_create_session(request.user)

        profile.status = "complete"
        profile.save(update_fields=["status", "updated_at"])

        session.current_step = "complete"
        session.mark_step_complete("complete")

        # Generate RAG-ready text (store/index via your embedding pipeline)
        rag_text = generate_rag_text(profile)
        logger.info(f"RAG document generated for user {request.user.id}:\n{rag_text}")

        return Response(
            {
                "message": "Onboarding complete! Your financial profile is ready.",
                "profile": FinancialProfileSerializer(profile).data,
            }
        )


class OnboardingSessionView(APIView):
    """GET /api/finance/session/ — fetch current onboarding state for resume support."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_or_create_profile(request.user)
        session = _get_or_create_session(request.user)
        return Response(
            {
                "session": OnboardingSessionSerializer(session).data,
                "missing_fields": get_missing_fields(profile),
                "profile_status": profile.status,
            }
        )