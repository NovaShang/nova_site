from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class VrModel(models.Model):
	name=models.CharField(max_length=50)
	bucket=models.CharField(max_length=60)
	urn=models.CharField(max_length=120)
	user=models.ForeignKey(User)