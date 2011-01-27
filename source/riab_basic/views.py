# Create your views here.

from django.template import Context,loader
from django.http import HttpResponse
from riab_basic.models import GeoServer

def index2(request):
        geoservers = GeoServer.objects.all()
        t = loader.get_template('index.html')
        c = Context({'geoservers':geoservers,})
	return HttpResponse(t.render(c))

def detail(request, GeoServer_id):
       return HttpResponse('%s'%GeoServer_id)
