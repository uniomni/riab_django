Start RIAB Server (example is for IP address 192.168.40.102 and port 8091)

	
python manage.py syncdb
python manage.py runserver 192.168.40.102:8091


Point browser to
http://192.168.40.102:8091/riab_basic/map

To Debug output from Django call to riab_server
http://192.168.40.102:8091/riab_basic/ajax/exposure:Population_2010/hazard:Earthquake_Ground_Shaking/1


If an external IP address is mapped to 192.168.40.102 it will also work.
