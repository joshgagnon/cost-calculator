# cost-calculator

#TODO

tests for structure


quarter days
heirarchical costs

catalex menu




#INSTALLATION



2. create `catalex_cc` database
3. `yarn install`
4. `virtualenv -p /usr/bin/python3.5 .`
5. `source bin/activate`
6. `python setup.py install`
7. `python migrate.py config_dev.py`



python setup.py install
python migrate.py config.py


/etc/systemd/system/cc.service
"""
[Unit]
Description=Sign uwsgi
After=network.target

[Service]
ExecStart=/var/www/cost-calculator/bin/uwsgi  /var/www/cost-calculator/cc.ini
User=cc
Restart=always

[Install]
WantedBy=multi-user.target

"""


/var/www/cost-calculator/cc.ini
"""
[uwsgi]
socket = 127.0.0.1:5651
wsgi-file = server.py
pyargv = config.py
callable = app
processes = 4
threads = 2
logto = /var/log/cc.log
#virtualenv = /var/www/cost-calculator/
wsgi-disable-file-wrapper = true
# set chdir for production
chdir = /var/www/cost-calculator
"""

To generate the dump, run the following command from project root.

`pg_dump catalex_cc--schema-only --no-owner --no-acl > db_functions/seed.sql`

