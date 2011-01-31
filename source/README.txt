Start RIAB Server
	
python manage.py syncdb
python manage.py 8091

Point browser to
http://127.0.0.1:8091/riab_basic/map

To Debug output from Django call to riab_server
http://127.0.0.1:8091/riab_basic/ajax/exposure:Population_2010/hazard:Earthquake_Ground_Shaking/1

