# cost-calculator

#TODO

tests for structure

server save/load
config file

confirmation dialog
delete save


quarter days
heirarchical costs

catalex menu




#INSTALLATION



2. create `catalex_cc` database
3. `npm install`
4. `virtualenv -p /usr/local/bin/python3.4 .`
5. `source bin/activate`
6. `python setup.py install`
7. `python migrate.py config_dev.py`



To generate the dump, run the following command from project root.

`pg_dump catalex_cc--schema-only --no-owner --no-acl > db_functions/seed.sql`