from django.urls import path
from .views import *

urlpatterns = [
    path("create/", create_profile),
    path("me/", get_profile),
    path("update/", update_profile),
]