from django.shortcuts import render
from home.models import *
from ezvr.models import *
from django.http import HttpResponse,HttpResponseRedirect
import qrcode
from io import BytesIO
import urllib

# Create your views here.

def home(request):
    data={
        "navitems":NavItem.objects.all()
    
    }
    return render(request,'ezvr.html',data)

def vrviewer(request,modelkey):
    data={
        "vrmodel":VrModel.objects.get(pk=modelkey)
    }
    return render(request,'debug.html',data)

def generate_qrcode(request, data):
    img = qrcode.make(data)

    buf = BytesIO()
    img.save(buf)
    image_stream= buf.getvalue()

    response = HttpResponse(image_stream, content_type = "image/png")
    return response

def create(request):
    print(request.user.is_authenticated())
    if (not request.user.is_authenticated()):
        return HttpResponseRedirect("/login/ezvr/create/")
    else:
        return render(request,"createvr.html")

def get_public_token(request):
    url='https://developer.api.autodesk.com/authentication/v1/authenticate'
    headers={"Content-Type":"application/x-www-form-urlencoded"}
    data='client_id=AEufTrqqxHwWoGK4tWsoWVsLGGbd8tvc&client_secret=qlZ2DWmmlKO1yw9u&grant_type=client_credentials&scope=bucket:create%20bucket:read%20data:read%20data:write'.encode()
    req=urllib.request.Request(url,data,headers,method="POST")
    resp=urllib.request.urlopen(req)
    return HttpResponse(resp,content_type = "application/json")



def add_new_vrmodel(request):
    if (request.method=="POST"):
        print("asdfasdfasdf")
        projectname=request.POST.get("projectname","")
        urn=request.POST.get("urn","")
        bucket=request.POST.get("bucket","")
        VrModel(name=projectname,urn=urn,user=request.user,bucket=bucket).save()
        return HttpResponse("OK")
    return HttpResponse("Failed")


def modelviewer(request,modelkey):
    data={
        "vrmodel":VrModel.objects.get(pk=modelkey)
    }
    return render(request,"modelviewer.html",data)



def modellist (request):
    if(request.user.is_authenticated()):
        data={"vrmodels":VrModel.objects.filter(user=request.user)}
        return render(request,"modellist.html",data)
    else:
        return HttpResponseRedirect("/login/ezvr/mymodels/")

def sharelist(request):
    data={
        "vrmodels":VrModel.objects.all()}
    return render(request,"modellist.html",data)
