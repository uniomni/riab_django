from riab_basic.models import RiabServer,GeoServer,GeoLayer
from django.contrib import admin

admin.site.register(RiabServer)
#admin.site.register(GeoServer) 
#admin.site.register(GeoLayer)

class GeoLayerInline(admin.TabularInline):
   model = GeoLayer
   extra = 3

class GeoServerAdmin(admin.ModelAdmin):
  fieldsets = [ (None, {'fields':['name','url','port','password','username']}) ]
  inlines = [GeoLayerInline]

admin.site.register(GeoServer,GeoServerAdmin) 
