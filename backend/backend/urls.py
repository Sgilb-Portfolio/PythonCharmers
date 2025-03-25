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

urlpatterns = [
    path('api/about/', about, name='about'),
    path('api/aboutdata/', get_aboutdata, name='get_aboutdata'),
    path('api/create-account/', create_account, name='create_account'),
    path('api/login/', login, name='login'),
    path("api/register-cognito/", register_user, name="register_cognito"),
    path("api/confirm-cognito/", confirm_user, name="confirm_cognito"),
    path("api/login-cognito/", login_user, name="login_cognito"),
    path("api/protected-cognito/", protected_view, name="protected_cognito"),
    path("api/reset-password/", reset_password, name="reset_password"),
    path("api/update-points/", update_points, name="update-points"),
    path("api/get-points/", get_points, name="get-points")
]
