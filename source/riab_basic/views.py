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

def map(request): #, exposure, hazard, bounding_box):
        t = loader.get_template('riab_basic/riab_map.html')
        c = Context({})
        return HttpResponse(t.render(c))

def setUpRiabAPI():
      test_url="http://localhost:8000"
      api = xmlrpclib.ServerProxy(test_url)
      print "Riab Start" 
      return api

# FIXME (Ted): This is just a demonstration showing robust ajax handling.      
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

def calculate_impact(request, layers, bounding_box):
        """Calculate Impact
	
	This is being called by URL's of the form
	http://127.0.0.1:8091/riab_basic/ajax/Population_2010/Earthquake_Ground_Shaking/96.956,-5.519,104.641,2.289/
        """
	
        geoserver_url = 'http://www.aifdr.org:8080/geoserver'
        geoserver_username = 'admin'
        geoserver_userpass = 'geoserver'
        # Common variables
        bounding_box = [float(bv) for bv in bounding_box.split(',')] #[96.956, -5.519, 104.641, 2.289]
        print 'Bounding Box  : ', str(bounding_box)

        #layers = ",hazard:Population_2010,exposure:Earthquake_Ground_Shaking"
	for layer in layers.split(','):
		if len(layer)>0:
			riabtype=layer.split(':')
			if len(riabtype)!=2:
				print "Error in layer string ",layers
				return
			if riabtype[0]=='exposure':
				exposure_data = riabtype[1]
			elif riabtype[0] == 'hazard':
				hazard_level = riabtype[1] 
			else:
				print "Error in layer ",layer
        print "hazard = %s, exposure = %s"%(exposure_data,hazard_level)	
        api=setUpRiabAPI()
        

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
						       'impact_calculated_by_riab',
						       'impact')

	# Calculate impact using API: using default impact function for the moment
        api.calculate(haz_handle, exp_handle, 0, imp_handle, bounding_box, '')
        username,userpass,geoserver_url,layer_name,workspace = api.split_geoserver_layer_handle(imp_handle)
        response={'impact_layer_handle': imp_handle,'geoserver_layer': "%s:%s"%(workspace,layer_name)}
        json = simplejson.dumps(response)

        return HttpResponse(json, 'application/javascript')


