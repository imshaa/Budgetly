
from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from budgetly import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/profiles/", include("apps.profiles.urls")),
    path("api/finance/", include("apps.financeSetup.urls")),
]

 
# Serve uploaded media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
