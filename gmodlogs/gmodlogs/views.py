from django.shortcuts import render
from gmodlogs.models import Log, LogAction, LogType

def index(request):
    return render(request, "index/index.html")