from django.db import models

# Create your models here.

#Riab Server reference class
class RiabServer(models.Model):
      url = models.CharField(max_length=200)
      port = models.IntegerField()
      name = models.CharField(max_length=200)

      def __unicode__(self):
           return self.name

#GeoServer
class GeoServer(models.Model):
      url = models.CharField(max_length=200)
      port = models.IntegerField()
      name = models.CharField(max_length=200)
      username =models.CharField(max_length=200)
      password =models.CharField(max_length=200)

      def __unicode__(self):
           return self.name

#Layer on a given geoserver
class GeoLayer(models.Model):
      name = models.CharField(max_length=200)
      geoserver = models.ForeignKey(GeoServer)
      workspace = models.CharField(max_length=200) 

      def __unicode__(self):
           return self.workspace+":"+self.name
      
class ImpactType(models.Model):
      name = models.CharField(max_length=200) 

      def __unicode__(self):
           return self.name

class ExposureType(models.Model):
      name = models.CharField(max_length=200) 

      def __unicode__(self):
           return self.name
