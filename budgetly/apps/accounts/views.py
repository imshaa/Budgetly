from django.contrib.auth import authenticate
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, OTP


def get_tokens_for_user(user):
    """Return access + refresh JWT tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ── SIGNUP ────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")
    confirm_password = request.data.get("confirm_password", "")

    if not email or not password:
        return Response({"error": "Email and password are required."})

    if password != confirm_password:
        return Response({"error": "Passwords do not match."})

    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters."})

    if User.objects.filter(email=email).exists():
        return Response({"error": "An account with this email already exists."})

    user = User.objects.create_user(email=email, password=password, username=username)
    

    # Generate & email OTP
    otp_obj = OTP.objects.create(email=email)
    otp_obj.generate_otp()
    otp_obj.save()

    # Print MPIN to terminal for testing
    print(f"MPIN for {email}: {otp_obj.otp}")

    # send_mail(
    #     subject="Verify your Budgetly account",
    #     message=f"Your verification code is: {otp_obj.otp}\n\nThis code expires in 10 minutes.",
    #     from_email="noreply@budgetly.com",
    #     recipient_list=[email],
    #     fail_silently=False,
    # )

    return Response({"message": "Account created. Please verify your email with the OTP sent."})


# ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email(request):
    email = request.data.get("email", "").strip().lower()
    otp = request.data.get("otp", "").strip()

    if not email or not otp:
        return Response({"error": "Email and OTP are required."})

    otp_obj = OTP.objects.filter(email=email, otp=otp, is_verified=False).last()

    if not otp_obj:
        return Response({"error": "Invalid or expired OTP."})

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found."})

    user.is_verified = True
    user.save()

    otp_obj.is_verified = True
    otp_obj.save()

    return Response({"message": "Email verified successfully. You can now log in."})


# ── LOGIN ─────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response({"error": "Email and password are required."})

    user = authenticate(username=email, password=password)

    if not user:
        return Response({"error": "Invalid email or password."})

    if not user.is_verified:
        return Response({"error": "Please verify your email before logging in."})

    tokens = get_tokens_for_user(user)
    return Response({
        "message": "Login successful.",
        **tokens,
    })


# ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get("email", "").strip().lower()

    if not email:
        return Response({"error": "Email is required."})

    if not User.objects.filter(email=email).exists():
        # Return a generic message so we don't leak account existence
        return Response({"message": "If that email exists, an OTP has been sent."})

    otp_obj = OTP.objects.create(email=email)
    otp_obj.generate_otp()
    otp_obj.save()

    send_mail(
        subject="Budgetly — Password Reset Code",
        message=f"Your password reset code is: {otp_obj.otp}\n\nIf you didn't request this, ignore this email.",
        from_email="noreply@budgetly.com",
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({"message": "If that email exists, an OTP has been sent."})


# ── RESET PASSWORD ────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get("email", "").strip().lower()
    otp = request.data.get("otp", "").strip()
    password = request.data.get("password", "")
    confirm_password = request.data.get("confirm_password", "")

    if password != confirm_password:
        return Response({"error": "Passwords do not match."})

    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters."})

    otp_obj = OTP.objects.filter(email=email, otp=otp, is_verified=False).last()

    if not otp_obj:
        return Response({"error": "Invalid or expired OTP."})

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found."})

    user.set_password(password)
    user.save()

    otp_obj.is_verified = True
    otp_obj.save()

    return Response({"message": "Password reset successfully. You can now log in."})




