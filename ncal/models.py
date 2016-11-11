from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Task(models.Model):
	user=models.ForeignKey(User)
	name=models.CharField(max_length=255)
	content=models.TextField()
	create_time=models.DateTimeField(auto_now_add=True)
	modify_time=models.DateTimeField(auto_now=True)
	deadline=models.DateField(blank=True)
	done=models.BooleanField(default=False)
	canceled=models.BooleanField(default=False)
