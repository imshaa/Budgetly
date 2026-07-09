from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import signup, verify_email, login, forgot_password, reset_password

urlpatterns = [
    path("signup/", signup),
    path("verify-email/", verify_email),
    path("login/", login),
    path("forgot-password/", forgot_password),
    path("reset-password/", reset_password),

    # JWT refresh — called automatically by the frontend when access token expires
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
