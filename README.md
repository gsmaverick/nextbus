## Getting Starting With Heroku

Order of commands:

    virtualenv venv --distribute
    venv\Scripts\activate
    pip install Flask SQLAlchemy
    pip freeze > requirements.txt (add psycopg2 req manually)

    bundle install --binstubs

    heroku config:add BUILDPACK_URL=https://github.com/heroku/heroku-buildpack-python

    heroku addons:add heroku-postgresql:dev

    PGPASSWORD=admin "C:\Program Files\PostgreSQL\9.2\bin\pg_dump.exe" -Fc --no-acl --no-owner -h 127.0.0.1 -U postgres nextbus > mydb.dump

    Upload to Dropbox

    heroku pgbackups:restore HEROKU_POSTGRESQL_GRAY_URL '...url...'

    pip install twilio
    pip install pytz
    pip freeze > requirements.txt (add psycopg2 req manually)

    heroku config:add TWILIO_ACCOUNT_SID=[....]
    heroku config:add TWILIO_AUTH_TOKEN=[....]

It is recommended you run the following command in the project directory on your
machine before getting started with development:




http://www.flickr.com/photos/tabor-roeder/5458577488/sizes/l/in/photostream/
http://thisissolar.com/
http://cir.ca/
http://getnowapp.com/
http://www.piictu.com/
