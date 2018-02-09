from functools import wraps, update_wrapper
import json
from datetime import datetime
from flask import (
    Flask, request, redirect, send_file, jsonify, session, abort, url_for,
    send_from_directory, Response, render_template, make_response, Blueprint, current_app
)

def protected(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return Response(json.dumps({'message': 'Unauthorized', 'type': 'LOGGED_OUT'}), 401)
        return f(*args, **kwargs)
    return decorated_function

def catalex_protected(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        secret = current_app.config.get('UPLOAD_DOCUMENT_SECRET')
        if not secret or secret != request.form.get('UPLOAD_DOCUMENT_SECRET'):
            return Response(json.dumps({'message': 'Unauthorized', 'type': 'INVALID_SECRET'}), 401)
        return f(*args, **kwargs)
    return decorated_function

def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.now()
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response

    return update_wrapper(no_cache, view)

def fullcache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Cache-Control'] = 'public, max-age=31536000'
        return response

    return update_wrapper(no_cache, view)


def login_redirect(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function



class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None, error=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload
        self.error = error

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


