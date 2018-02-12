"""

Functions for working with the database

"""

import psycopg2
import psycopg2.extras
from flask import g, current_app
import uuid
import json
from collections import defaultdict

def get_db():
    """
    Return a connected database instance and save it to flask globals for next time
    """
    if not hasattr(g, 'db') or g.db.closed:
        g.db = connect_db_config(current_app.config)
    return g.db


def close_db():
    """
    If we have saved a conencted database instance to flask globals, close the connection
    """
    if hasattr(g, 'db') and not g.db.closed:
        g.db.close()


def connect_db_config(config):
    """
    Create a psycopg2 connection to the database
    """
    connection = psycopg2.connect(
        database=config['DB_NAME'],
        user=config['DB_USER'],
        password=config['DB_PASS'],
        host=config['DB_HOST'])
    return connection


def upsert_user(user):
    """
    Create or update a user
    """
    database = get_db()

    user_dict = defaultdict(lambda: False)
    user_dict.update(user)

    user = user_dict

    if current_app.config.get('USE_DB_UPSERT'):
        if user.get('subscribed', None) is not None:
            query = """
                INSERT INTO users (user_id, name, email, subscribed, email_verified)
                VALUES (%(user_id)s, %(name)s, %(email)s, %(subscribed)s, %(email_verified)s)
                ON CONFLICT (user_id) DO UPDATE SET name = %(name)s, email = %(email)s, subscribed = %(subscribed)s;
            """
        else:
            query = """
                INSERT INTO users (user_id, name, email)
                VALUES (%(user_id)s, %(name)s, %(email)s)
                ON CONFLICT (user_id) DO UPDATE SET name = %(name)s, email = %(email)s
            """
        with database.cursor() as cursor:
            cursor.execute(query, user)
        database.commit()
    else:
        try:
            if user.get('subscribed', None) is not None:
                query = """
                    INSERT INTO users (user_id, name, email, subscribed, email_verified)
                    VALUES (%(user_id)s, %(name)s, %(email)s, %(subscribed)s, %(email_verified)s)
                """
            else:
                query = """
                    INSERT INTO users (user_id, name, email)
                    VALUES (%(user_id)s, %(name)s, %(email)s)
                """
            with database.cursor() as cursor:
                cursor.execute(query, user)

        except:
            database.rollback()
            if user.get('subscribed', None) is not None:
                query = """
                    UPDATE users SET name = %(name)s, email = %(email)s, subscribed = %(subscribed)s, email_verified = %(email_verified)s where user_id = %(user_id)s;
                """
            else:
                query = """
                    UPDATE users SET name = %(name)s, email = %(email)s where user_id = %(user_id)s;
                """
            with database.cursor() as cursor:
                cursor.execute(query, user)
        database.commit()
    return


def get_user_info(user_id):
    """
    Get a user's basic info
    """
    database = get_db()
    with database.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        query = """
            SELECT user_id, name, email, email_verified, subscribed from users where user_id = %(user_id)s
        """
        cursor.execute(query, {'user_id': user_id})
        try:
            result = dict(cursor.fetchone())
            database.commit()
            return result
        except TypeError:
            return None


def get_saved_data(user_id, saved_id):
    database = get_db()
    with database.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        query = """
            SELECT data from saved where user_id = %(user_id)s and saved_id = %(saved_id)s
        """
        cursor.execute(query, {'user_id': user_id, 'saved_id': saved_id})
        try:
            result = dict(cursor.fetchone())
            return result
        except TypeError:
            return None


def del_saved_data(user_id, saved_id):
    database = get_db()
    with database.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        query = """
            DELETE FROM saved where user_id = %(user_id)s and saved_id = %(saved_id)s
        """
        cursor.execute(query, {'user_id': user_id, 'saved_id': saved_id})
        try:
            database.commit()
        except TypeError:
            return None


def update_saved_data(user_id, saved_id, data):
    database = get_db()
    with database.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        query = """
            UPDATE saved SET data = %(data)s where user_id = %(user_id)s and saved_id = %(saved_id)s
        """
        cursor.execute(query, {'user_id': user_id, 'saved_id': saved_id, 'data': psycopg2.extras.Json(data)})
        try:
            database.commit()
        except TypeError:
            return None


def get_saved_list(user_id):
    database = get_db()
    with database.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        query = """
            SELECT saved_id, name FROM saved where user_id = %(user_id)s
        """
        cursor.execute(query, {'user_id': user_id})
        try:
            result = cursor.fetchall()
            database.commit()
            return [dict(x) for x in result]
        except TypeError:
            return None


def create_saved_data(user_id, args):
    database = get_db()
    with database.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        query = """
            INSERT INTO saved (user_id, name, data) VALUES (%(user_id)s, %(name)s, %(data)s)
        """
        cursor.execute(query, {'user_id': user_id, 'name': args['name'], 'data': psycopg2.extras.Json(args['data'])})
        try:
            database.commit()
        except TypeError:
            return None

