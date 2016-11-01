from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from home.models import *
from django.core.validators import validate_slug,validate_email
from django.contrib.auth.models import User
from django.contrib import auth

# Create your views here.
def index(request):
    data={}
    data['navitems']=NavItem.objects.all()
    return render(request,'home.html',data)

def register(request):
    data={
        'username':"",
        'user_exist':False,
        'mail':"",
        'mail_error':False,
        'password_error':False,
        'password_not_same':False,
        'navitems':NavItem.objects.all()
    }
    if(request.method=="POST"):
        data['username']=request.POST.get('username','')
        data['mail']=request.POST.get('mail','')
        password=request.POST.get('password','')
        password2=request.POST.get('password2','')
        try:
            validate_email(data['mail'])
        except:
            data['mail_error']=True
        try:
            validate_slug(data['username'])
        except:
            data['user_exist']=True
        if (len(User.objects.filter(username=data['username']))>0):
            data['user_exist']=True
        if (len(password)<6):
            data['password_error']=True
        if (password!=password2):
            data['password_not_same']=True
        if(not (data['password_error'] or data['password_not_same'] or data['mail_error'] or data['user_exist'])):
            user=User.objects.create_user(data['username'],data['mail'],password)
            user.save()
            return HttpResponseRedirect('/regsuccess/')        
    return render(request,'register.html',data)

def reg_success(request):
    data={}
    data['navitems']=NavItem.objects.all()

    return render(request,'regsuccess.html',data)

def login(request,redirect):
    data={}
    data['navitems']=NavItem.objects.all()
    data['username']=""
    data['password_error']=False
    if (request.method=="POST"):
        username=request.POST.get('username','')
        password=request.POST.get('password','')
        user=auth.authenticate(username=username,password=password)
        if user and user.is_active:
            auth.login(request,user)
            return HttpResponseRedirect("/"+redirect)
        else:
            data['username']=username
            data['password_error']=True
    return render(request,'login.html',data)

def logout(request):
    auth.logout(request)
    return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))