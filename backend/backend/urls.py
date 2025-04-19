"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from api.views import about
from api.views import create_account
from api.views import login
from api.views import get_aboutdata
from api.views import register_user, confirm_user, login_user, protected_view, reset_password, update_points, get_points
from api.views import itunes_search
from api.views import forgot_password
from api.views import verify_mfa
from api.views import get_profile, update_profile
from api.views import audit_logs_view
from api.views import get_driver_points_by_username
from api.views import get_sponsors, get_sponsor_details
from api.views import apply_sponsor
from api.views import get_sponsor_applications
from api.views import update_application_status
from api.views import get_driver_applications
from api.views import confirm_join_sponsor
from api.views import cancel_application
from api.views import get_sponsor_details_by_account
from api.views import update_sponsor_rules
from api.views import get_driver_sponsors
from api.views import sponsor_catalog_add

urlpatterns = [
    path('api/about/', about, name='about'),
    path('api/aboutdata/', get_aboutdata, name='get_aboutdata'),
    path('api/create-account/', create_account, name='create_account'),
    path('api/login/', login, name='login'),
    path("api/register-cognito/", register_user, name="register_cognito"),
    path("api/confirm-cognito/", confirm_user, name="confirm_cognito"),
    path("api/login-cognito/", login_user, name="login_cognito"),
    path("api/protected-cognito/", protected_view, name="protected_cognito"),
    path("api/reset-password/", reset_password, name="reset-password"),
    path("api/update-points/", update_points, name="update-points"),
    path("api/get-points/", get_points, name="get-points"),
    path("api/itunes-search/", itunes_search, name="itunes-search"),
    path("api/forgot-password/", forgot_password, name="forgot-password"),
    path("api/verify-mfa/", verify_mfa, name="verify-mfa"),
    path("api/get-profile/<str:username>/", get_profile, name="get-profile"),
    path("api/update-profile/<str:username>/", update_profile, name="update-profile"),
    path("api/audit-logs", audit_logs_view, name="audit-logs"),
    path('api/get-driver-points/<str:username>', get_driver_points_by_username, name='get_driver_points_by_username'),
    path('api/get-sponsors/', get_sponsors, name='get-sponsors'),
    path('api/get-sponsor-details/<int:sponsor_id>/', get_sponsor_details, name='get-sponsor-details'),
    path('api/apply-sponsor/', apply_sponsor, name='apply-sponsor'),
    path('api/get-sponsor-applications/', get_sponsor_applications, name='get-sponsor-applications'),
    path('api/update-application-status/', update_application_status, name='update-application-status'),
    path('api/get-driver-applications/', get_driver_applications, name='get-driver-applications'),
    path('api/confirm-join-sponsor/', confirm_join_sponsor, name='confirm-join-sponsor'),
    path('api/cancel-application/', cancel_application, name='cancel-application'),
    path("api/get-sponsor-details-by-account/", get_sponsor_details_by_account, name="get-sponsor-details-by-account"),
    path("api/update-sponsor-rules/", update_sponsor_rules, name="update-sponsor-rules"),
    path("api/get-driver-sponsors/", get_driver_sponsors, name="get-driver-sponsors"),
    path("api/sponsor-catalog-add/", sponsor_catalog_add, name="sponsor-catalog-add"),
]
