from __future__ import print_function
import errno
import logging
import json
import sys
from flask import (
    Flask, request, redirect, send_file, jsonify, session, abort, url_for,
    send_from_directory, Response, render_template, make_response
)
import db
import requests
import os
import os.path
from utils import login_redirect, nocache, InvalidUsage
from api import api, get_user_info
import uuid
from raven.contrib.flask import Sentry


logging.basicConfig()

app = Flask(__name__, static_url_path='', static_folder='public', template_folder='public')
app.register_blueprint(api, url_prefix='/api')
config_file_path = os.environ.get('CONFIG_FILE') or sys.argv[1]
app.config.from_pyfile(os.path.join(os.getcwd(), config_file_path))

PORT = app.config.get('PORT')
sentry = None
if(app.config.get('SENTRY')):
    sentry = Sentry(app, dsn=app.config.get('SENTRY'))


@app.route('/login', methods=['GET'])
def login():
    try:
        args = request.args.to_dict()
        user_data = {}

        if app.config.get('DEV_USER_ID'):
            user_data = {
                'user_id': app.config.get('DEV_USER_ID'),
                'name': 'Dev User',
                'email': 'dev@user.com'
            }
        else:
            code = args.get('code')

            # If the is no code, redirect to the users site to get a code
            if not all([code]):
                next = args.get('next')
                oauthUrl = app.config.get('OAUTH_URL')

                # include the next url if there is one
                if next is not None:
                    oauthUrl += '?next=' + args.get('next')

                return redirect(oauthUrl)

            # We have a code, so use it to get and access token
            params = {
                'code': code,
                'grant_type': 'authorization_code',
                'client_id': app.config.get('OAUTH_CLIENT_ID'),
                'client_secret': app.config.get('OAUTH_CLIENT_SECRET'),
                'redirect_uri': app.config.get('LOGIN_URL'),
                'next': args.get('next')
            }

            response = requests.post(
                app.config.get('AUTH_SERVER') + '/oauth/access_token',
                data=params
            )

            access_data = response.json()

            response = requests.get(
                app.config.get('AUTH_SERVER') + '/api/user',
                params={'access_token': access_data['access_token']}
            )

            user_data = response.json()
            user_data['user_id'] = user_data['id']
            user_data['name'] = user_data['name']
            user_data['subscribed'] = ('Court Costs' in user_data['services']) or app.config.get('ALL_SUBSCRIBED', False)
            print(user_data)

        db.upsert_user(user_data)
        session['user_id'] = user_data['user_id']

        redirect_uri = request.args.get('next', url_for('catch_all'))
        return redirect(redirect_uri)
    except Exception as e:
        print(e)
        raise InvalidUsage('Could not log in', status_code=500, error=e)


@app.route('/upgrade', methods=['GET'])
def upgrade():
    return redirect(app.config.get('AUTH_SERVER') + '/my-services')


@app.route('/signup', methods=['GET'])
def signup():
    return redirect(app.config.get('OAUTH_URL'))


@app.route('/account', methods=['GET'])
def account():
    return redirect(app.config.get('AUTH_SERVER'))


@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    return redirect(app.config.get('USER_LOGOUT_URL'))

@nocache
def render_root():
    # TODO go async or combine these queries
    return render_template('index.html', store={'user': get_user_info()},
                           token={'_csrf_token': generate_csrf_token()})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_root()


@app.errorhandler(401)
def custom_401(error):
    if hasattr(error, 'description'):
        return Response(json.dumps(error.description), 401)
    return Response(json.dumps({'message': 'Unauthorized'}), 401)


@app.errorhandler(404)
def not_found(error):
    if request.blueprint == 'api':
        return Response(json.dumps(error.description), 404)
    return send_index()


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    if sentry:
        if isinstance(error, InvalidUsage):
            sentry.captureException(error.error)
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


def generate_csrf_token():
    if '_csrf_token' not in session:
        session['_csrf_token'] = uuid.uuid4().hex
    return session['_csrf_token']


@app.before_request
def csrf_protect():
    if request.method != "GET" and not app.testing and not request.endpoint != 'external':
        token = session.get('_csrf_token', None)
        data = request.get_json() or request.form
        if not token or token != data.get('_csrf_token'):
            abort(401, {'type': 'INVALID_TOKEN'})


@login_redirect
def send_index(path=None):
    return render_root()


if __name__ == '__main__':
    print('Running on %d' % PORT)
    app.run(port=PORT, debug=True, host='0.0.0.0', threaded=True)