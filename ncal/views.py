from django.shortcuts import render
from django.core import serializers
from django.http import HttpResponse,HttpResponseRedirect
from ncal.models import *
from datetime import datetime
# Create your views here.

def add_task (request):
	if request.method=="POST" and request.user.is_authenticated():
		user=request.user
		name=request.POST.get('name','')
		content=request.POST.get('content','')
		deadlinestr=request.POST.get('deadline','')
		deadline=datetime.strptime(deadlinestr,'%Y-%m-%d').date
		task=Task(user=user,name=name,content=content,deadline=deadline)
		task.save()
		data='{"result","succeed"}'
	else:
		data='{"result","error"}'
	return HttpResponse(data,content_type = "application/json")

def get_undone_tasks (request):
	if request.user.is_authenticated():
		tasks=Task.objects.filter(user=request.user)
		data=serializers.serialize("json",tasks)
	else :
		data="{[]}"
	return HttpResponse(data,content_type = "application/json")


def index(request):
	data={}
	return render(request,'ncal.html',data)