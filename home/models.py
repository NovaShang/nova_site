from django.db import models

# Create your models here.

class NavItem(models.Model):
	name=models.CharField(max_length=30)
	url=models.CharField(max_length=100)

	def __str__ (self):
		return self.name