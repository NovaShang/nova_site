from django.db import models

# Create your models here.

class Tag(models.Model):
	name=models.CharField(max_length=20)

	def __str__(self):
		return self.name

class Article(models.Model):
	title=models.CharField(max_length=255)
	time=models.DateTimeField(auto_now_add=True)
	summary=models.CharField(max_length=255)
	content=models.TextField()
	tags=models.ManyToManyField(Tag)

	def __str__(self):
		return self.title



