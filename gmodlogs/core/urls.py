"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
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
from django.contrib import admin
from django.urls import path
import gmodlogs.views as gmodlogs
import apiv1.views as api_apiv1

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', gmodlogs.index),
    path('api/v1/get_logs/', api_apiv1.get_logs),
    path('api/v1/get_logs_types/', api_apiv1.get_logs_types),
    path('api/v1/get_logs_actions/', api_apiv1.get_logs_actions),
    path('api/v1/save_log/', api_apiv1.save_log),
]

from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)