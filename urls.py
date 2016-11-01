"""nova_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from rest_framework import routers
import nova_calendar.views
import blog.views
import home.views

router=routers.DefaultRouter()
router.register(r'ncal/tasks',nova_calendar.views.TaskViewSet)

urlpatterns = [
    url(r'^$',home.views.index,name='home'),
    url(r'^',include(router.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^blog/([0-9]+)',blog.views.blog_article),
    url(r'^blog/$',blog.views.blog_index),
    url(r'^blog/tag/([0-9]+)',blog.views.tag),
    url(r'^blog/search',blog.views.search),
    url(r'ncal/', nova_calendar.views.home),
    url(r'^api-auth/', include('rest_framework.urls'))
]
