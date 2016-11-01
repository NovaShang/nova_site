from django.shortcuts import render
from rest_framework import viewsets
from nova_calendar.serializers import *

# Create your views here.

def home(request):
    return render(request,"calendar.html")


# RestFUL API ViewSets

class TaskViewSet(viewsets.ModelViewSet):
    queryset=Task.objects.all()
    serializer_class=TaskSerializer


