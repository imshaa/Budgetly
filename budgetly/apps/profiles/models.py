from django.db import models
from django.conf import settings
from datetime import date

User = settings.AUTH_USER_MODEL


class Profile(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("prefer_not_to_say", "Prefer not to say"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    phone_number = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=25, choices=GENDER_CHOICES)

    address = models.TextField(blank=True, null=True)
    residential_address = models.TextField(blank=True, null=True)
    currency = models.CharField(max_length=10)

    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def is_18_plus(self):
        today = date.today()
        age = (
            today.year - self.date_of_birth.year
            - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        )
        return age >= 18

    def __str__(self):
        return f"{self.user.email} — Profile"

