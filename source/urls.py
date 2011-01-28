from django.conf.urls.defaults import *
from django.views.generic import DetailView, ListView
from riab_basic.models import GeoServer

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    (r'^templates/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': 'riab_basic'}),
 
    (r'^riab_basic/$',ListView.as_view(queryset=GeoServer.objects, context_object_name='geoserver',template_name='riab_basic/index.html')),
    (r'^admin/', include(admin.site.urls)),
    (r'^riab_basic/(?P<GeoServer_id>\d+)/$',DetailView.as_view(model=GeoServer,template_name='riab_basic/detail.html')),
    (r'^riab_basic/ajax/(\d*)/$','riab_basic.views.ajax'),
    (r'^riab_basic/map/(\d*)/$','riab_basic.views.map')
)
