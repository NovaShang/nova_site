from nova_calendar.models import *
from rest_framework import serializers

class TaskSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model=Task
        fields=('name','done','description','deadline','create_time','finish_time')


