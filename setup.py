from setuptools import setup

setup(name='cost-calculator',
      version='0.0.1',
      description='Generate cost schedules',
      url='http://github.com/joshgagnon/cost-calculator',
      author='Joshua Gagnon',
      author_email='josh.n.gagnon@gmail.com',
      license='MIT',
      install_requires=[
          'flask',
          'requests',
          'psycopg2',
          'flask_restful',
          'raven[flask]'
      ],
        dependency_links=[
            "git+https://github.com/pmaupin/pdfrw.git#egg=pdfrw"
        ],
      zip_safe=False)
