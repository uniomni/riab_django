"""Install and configure Django locally

Assume this is run from the riab_django top directory
"""

import os 

def run(s):
    print s
    os.system(s)
    
run('cd /tmp; svn co http://code.djangoproject.com/svn/django/trunk/ django-trunk')
run('cd /tmp/django-trunk; sudo python setup.py install')
run('cd source; python manage.py syncdb')


