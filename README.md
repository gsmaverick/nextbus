# Bus Ticker

Bus Ticker helps users find next bus times quickly in Hamilton from their
iOS or Android device.  The times are based on the GTFS data set released by the
HSR on their [open data site](http://www.hamilton.ca/ProjectsInitiatives/OpenData/).

## Setup Development Environment

Start by setting up a virtual environment for this project:

    virtualenv venv --distribute

You must activate the virtual environment in every terminal session:

    venv\Scripts\activate

Now install all the dependencies for Bus Ticker and freeze them:

    pip install Flask SQLAlchemy pytz twilio
    pip freeze > requirements.txt

Then install all the gems we need to generate static assets:

    bundle install --binstubs

Foreman is used to manage running and reloading the server.  Create a .env file
and put your Twilio credentials in it, with the same key names as in the Heroku
deployment section, if you want to use the send to phone functionality in
development.  To start the server:

    foreman start -e .env -f Procfile.dev

Now build and watch the static assets:

    ruby bin\guard


## Deploy On Heroku

First the database plan needs to be upgraded as the database for Bus Ticker
contains well over 200,000 rows and that is above the limit of the default
Heroku database plan:

    heroku addons:add heroku-postgresql:dev

Then generate a full database dump from the local database:

    pg_dump -Fc --no-acl -O -h 127.0.0.1 -U postgres -W password nextbus -f busticker.dump

Upload this file so it is publically accessible, say on Dropbox. Then use this
dump to restore the production database on Heroku:

    heroku addons:add pgbackups
    heroku pgbackups:restore HEROKU_POSTGRESQL_GRAY_URL '...database dump url...'

Then the authentication credentials for Twilio need to be set as Heroku
environment variables:

    heroku config:add TWILIO_ACCOUNT_SID='See Twilio Dashboard'
    heroku config:add TWILIO_AUTH_TOKEN='See Twilio Dashboard'

Finally, set the buildpack for the app:

    heroku config:add BUILDPACK_URL=https://github.com/heroku/heroku-buildpack-python
