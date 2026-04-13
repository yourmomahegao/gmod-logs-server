from django.contrib import admin
from gmodlogs.models import *
import sys, inspect

for name, obj in inspect.getmembers(sys.modules[__name__]):
    if inspect.isclass(obj):
        if not getattr(obj._meta, 'abstract', False):
            admin.site.register(obj)

# Register your models here.
