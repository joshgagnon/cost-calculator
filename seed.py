from __future__ import print_function
import importlib
import sys
import psycopg2
import os
import argparse


def seed(db):
    for filename in ['seed.sql']:
        with open(os.path.join('db_functions', filename)) as f, db.cursor() as cur:
            print('Running', filename)
            sql = f.read()
            cur.execute(sql)



def connect_db(config):
    return psycopg2.connect(
        database=config.DB_NAME,
        user=config.DB_USER,
        host=config.DB_HOST,
        password=config.DB_PASS)


def populate_migration(db):
    files = set([f for f in os.listdir('migrations') if not f.startswith('_') and not f.endswith('.pyc')])
    with db.cursor() as cur:
        for filename in files:
            cur.execute("INSERT INTO migrations (name) VALUES (%(filename)s) ", {
                'filename': filename
            })



def run(args):
    config = importlib.import_module(args.get('config').replace('.py', ''))
    db = connect_db(config)

    if not args.get('migrations_only'):
        seed(db)
    populate_migration(db)

    db.commit()
    print('Seed Complete')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Seed the db')
    parser.add_argument('config', help='config file')
    parser.add_argument('--migrations-only', help='only add migration entries', action='store_true')
    args = vars(parser.parse_args())
    run(args)
