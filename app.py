import time, os
from flask import Flask
from handlers import *
from utils import set_urls

# All routes that the application should respond to.
routes = [
    ('/', 'pages.index', pages.index),
    ('/about', 'pages.about', pages.about),
    ('/app', 'pages.app', pages.app),
    ('/help', 'pages.help', pages.help),

    ('/api/search/geo/<string:query>', 'apis.geo_search', apis.geo_search, {'methods': ['GET', 'POST']}),
    ('/api/search/text/<string:query>', 'apis.text_search', apis.text_search, {'methods': ['GET', 'POST']}),
    ('/api/send_to_phone', 'apis.send_to_phone', apis.send_to_phone, {'methods': ['POST']}),
    ('/api/stops/<string:stop_id>', 'apis.show_stop', apis.show_stop),

    ('/apple-touch-icon-precomposed.png', 'statics.icon', statics.icon),
    ('/apple-touch-icon.png', 'statics.icon', statics.icon),
    ('/favicon.ico', 'statics.favicon', statics.favicon),
    ('/app.manifest', 'statics.manifest', statics.manifest)
]

if __name__ == '__main__':
    try:
        # Adjust the timezone to Eastern to ensure that date/time calculations
        # are accurate for Hamilton times.  Non-UNIX systems don't support
        # time.tzset() so this hack doesn't work on those systems.
        os.environ['TZ'] = 'US/Eastern'
        time.tzset()
    except:
        print "Could not set time zone."

    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))

    # Create the app.
    app = Flask(__name__)

    # Attach all application routes.
    set_urls(app, routes)

    # Let's go!
    app.run(host='0.0.0.0', port=port, debug=True)