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
import ezvr.views
import blog.views
import home.views

router=routers.DefaultRouter()
router.register(r'ncal/tasks',nova_calendar.views.TaskViewSet)

urlpatterns = [
    url(r'^$',home.views.index,name='home'),
    url(r'^register/$',home.views.register),
    url(r'^regsuccess/$',home.views.reg_success),
    url(r'^login/(.*)$',home.views.login),
    url(r'^logout/$',home.views.logout),
    url(r'^',include(router.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^blog/([0-9]+)',blog.views.blog_article),
    url(r'^blog/$',blog.views.blog_index),
    url(r'^blog/tag/([0-9]+)',blog.views.tag),
    url(r'^blog/search',blog.views.search),
    url(r'^ncal/', nova_calendar.views.home),
    url(r'^ezvr/$',ezvr.views.home),
    url(r'^ezvr/mymodels/$',ezvr.views.modellist),
    url(r'^ezvr/sharedmodels/$',ezvr.views.sharelist),
    url(r'^ezvr/publicmodels/$',ezvr.views.home),
    url(r'^ezvr/modelviewer/([0-9]+)$',ezvr.views.modelviewer),
    url(r'^ezvr/create/$',ezvr.views.create),
    url(r'^ezvr/vrviewer/([0-9]+)$',ezvr.views.vrviewer),
    url(r'^ezvr/gettoken$',ezvr.views.get_public_token),
    url(r'^ezvr/addvrmodel/$',ezvr.views.add_new_vrmodel),
    url(r'^api-auth/', include('rest_framework.urls')),
    url(r'^qrcode/(.+)$', ezvr.views.generate_qrcode),
]
