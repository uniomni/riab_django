# Create your views here.

from django.template import Context,loader
from django.http import HttpResponse
from riab_basic.models import GeoServer
from django.core import serializers
import xmlrpclib
from django.utils import simplejson

def index(request):
        geoservers = GeoServer.objects.all()
        t = loader.get_template('index.html')
        c = Context({'geoservers':geoservers,})
	return HttpResponse(t.render(c))

def map(request,pk):
        t = loader.get_template('riab_basic/riab_map.html')
        c = Context({})
        return HttpResponse(t.render(c))

def setUpRiabAPI():
      test_url="http://localhost:8000"
      api = xmlrpclib.ServerProxy(test_url)
      print "Riab Start" 
      return api

def ajax2(request, pk):
      format='json'
      api=setUpRiabAPI()
      if True: #request.is_ajax():
        proxy = xmlrpclib.ServerProxy('http://localhost:8000/')
        if format == 'xml':
            mimetype = 'application/xml'
        if format == 'json':
            mimetype = 'application/javascript'
         
        response={'version':api.version()}
        json = simplejson.dumps(response)
            
        #print version
        #data = serializers.serialize(format,[Version()]) # GeoServer.objects.all())
        #print data
        return HttpResponse(json,mimetype)
      else:
       return HttpResponse('Not Ajax')

def ajax(request, pk):
        """Test that impact model can be computed correctly using riab server api through XMLRPC
        """
        geoserver_url = 'http://www.aifdr.org:8080/geoserver'
        geoserver_username = 'admin'
        geoserver_userpass = 'geoserver'
        # Common variables
        bounding_box = [96.956, -5.519, 104.641, 2.289]


        api=setUpRiabAPI()
        
        exposure_data, hazard_level = 'Population_2010', 'Earthquake_Ground_Shaking'

            # Create handles for hazard and exposure
        haz_handle = api.create_geoserver_layer_handle(geoserver_username,
                                                                geoserver_userpass,
                                                                geoserver_url,
                                                                hazard_level,
                                                                'hazard')

        exp_handle = api.create_geoserver_layer_handle(geoserver_username,
                                                                geoserver_userpass,
                                                                geoserver_url,
                                                                exposure_data,
                                                                'exposure')


            # Create handle for calculated result
        imp_handle = api.create_geoserver_layer_handle(geoserver_username,
                                                                geoserver_userpass,
                                                                geoserver_url,
                                                                'earthquake_impact_calculated_by_riab',
                                                                'impact')

            # Calculate impact using API: using default impact function for the moment
        api.calculate(haz_handle, exp_handle, 0, imp_handle, bounding_box, '')
        username,userpass,geoserver_url,layer_name,workspace = api.split_geoserver_layer_handle(imp_handle)
        response={'impact_layer_handle': imp_handle,'geoserver_layer': "%s:%s"%(workspace,layer_name)}
        json = simplejson.dumps(response)

        return HttpResponse(json,'application/javascript')


