import os
import requests
import json


path = os.path.dirname(__file__)

with open(os.path.join(path, '../source.json'), 'r') as source:
    for k, v in json.loads(source.read()).items():
        response = requests.get(v)
        with open(os.path.join(path, '../src/xml/%s.xml' % k), 'wb') as out:
            out.write(response.content)
