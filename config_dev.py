import getpass

PORT=5651

SERVER_NAME = 'localhost:%s' % PORT
LOGIN_URL = 'http://localhost:%s/login' % PORT
AUTH_SERVER = 'http://192.168.0.153:8000'
OAUTH_URL = 'http://192.168.0.153:8000/cc-login'

USER_LOGOUT_URL = 'http://192.168.0.153:8000/auth/logout'

OAUTH_CLIENT_ID = 'cc'
OAUTH_CLIENT_SECRET = 'cc'

ODDITY_URL = 'https://oddity.catalex.nz/render'

SECRET_KEY = 'dfglihdklsjblfkdjhvliakhjdlkjashdfkleahs'

DB_NAME = 'catalex_cc'
DB_USER = getpass.getuser()
DB_PASS = ''
DB_HOST = '127.0.0.1'
