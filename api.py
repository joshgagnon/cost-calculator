from flask import (
    Flask, request, redirect, send_file, jsonify, session, abort, url_for,
    send_from_directory, Response, render_template, make_response, Blueprint,
    current_app, stream_with_context
)
from io import BytesIO
from subprocess import Popen, STDOUT
import uuid
import tempfile
import db
from copy import deepcopy
from base64 import b64decode
from urllib.parse import urlparse
import zipfile
import json
from utils import login_redirect, protected, nocache, fullcache, InvalidUsage, catalex_protected
import requests
from werkzeug.exceptions import HTTPException
from uuid import uuid4
import requests
from flask_restful import reqparse, abort, Api, Resource

api = Blueprint('api', __name__)
api_restful = Api(api)

def get_user_info():
    if session.get('user_id'):
        return db.get_user_info(session['user_id'])



@api.route('/render', methods=['POST'])
@protected
@nocache
def render():
    args = request.get_json()
    url = current_app.config.get('ODDITY_URL')
    req = requests.post(url, json=args)
    return Response(stream_with_context(req.iter_content()), headers=dict(req.headers))




class SavedData(Resource):
    def get(self, id):
        return db.get_saved_data(session['user_id'], id)

    def delete(self, id):
        return db.del_saved_data(session['user_id'], id), 204

    def put(self, id):
        args = request.get_json()
        return db.update_saved_data(session['user_id'], id, args['data']), 201



class SavedDataList(Resource):
    def get(self):
        return db.get_saved_list(session['user_id'])

    def post(self):
        args = request.get_json()
        return db.create_saved_data(session['user_id'], args)


api_restful.add_resource(SavedDataList, '/saved')
api_restful.add_resource(SavedData, '/saved/<id>')


