from django.db import models

# Create your models here.
class LogType(models.Model):
    _id = models.AutoField(),
    name = models.CharField()
    
    def __str__(self):
        return self.name
    
class LogAction(models.Model):
    _id = models.AutoField(),
    name = models.CharField()
    
    def __str__(self):
        return self.name

class Log(models.Model):
    _id = models.BigAutoField(),
    type = models.ForeignKey(to=LogType, on_delete=models.CASCADE)
    action = models.ForeignKey(to=LogAction, on_delete=models.CASCADE)
    steam_id = models.CharField(null=True, blank=True)
    steam_id64 = models.CharField(null=True, blank=True)
    nickname = models.CharField(null=True, blank=True)
    data = models.TextField()
    insertion_datetime = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"[{self.type}] {self.data}"