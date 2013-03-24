import time, urllib2, os, re
from flask import Flask, jsonify, Response, render_template, json, send_from_directory, request
from api import search, stop, services

app = Flask(__name__)

@app.route('/')
def index():
    user_agent = request.headers.get('User-Agent')
    isMobile = re.search('android|ipad|iphone', user_agent, re.IGNORECASE)
    tmpl = 'index' if isMobile else 'marketing'

    return render_template('%s.html' % tmpl)

@app.route('/app')
def app_home():
    t = int(time.time())
    return render_template('index.html', t=t)

@app.route('/help', methods=['GET'])
def show_help():
    return render_template('help.html', header=True)

@app.route('/about', methods=['GET'])
def show_about():
    """
        Main entry point of the application for mobile and desktop users.  We detect
        if a mobile phone is in use and serve up the mobile version instead.
    """
    return render_template('about.html', header=True)

@app.route('/send_to_phone', methods=['POST'])
def send_to_phone():
    """
        Sends an SMS message to the specified phone if it is valid.  Returns the
        following JSON:
            {
                "status": "Error/success based on whether the message was sent",
                "text": "Clarifying error or success message"
            }
    """
    number = request.form['number'].strip('()-')
    result = services.sendToNumber(number)

    resp = Response(json.dumps(result), status=200, mimetype='application/json')
    return resp

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
        'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/app.manifest')
def cache_manifest():
    if os.environ.get('ENVIRONMENT_TYPE') == 'dev':
        return Response('', status=404, mimetype='text/html')

    return send_from_directory(os.path.join(app.root_path, 'static'),
        'cache.manifest', mimetype='text/cache-manifest')

@app.route('/api/stops/<int:stop_id>', methods=['GET'])
def show_stop(stop_id):
    """
        Returns JSON containing stop information for this stop id as well as a list
        of all upcoming bus routes and the specific arrival times.

        Any information for this stop is stored in `info` in the form:
            {
                "routes": "Number of routes that arrive at this stop",
                "stop_id": "4 digit code uniquely identifying this stop",
                "stop_name": "Name of the stop"
            }

        A route is in the following form:
            {
                "name": "Route name...",
                "number": "Route number...",
                "times": [
                    {
                        "duration": "Number of minutes until bus arrives...",
                        "endpoint": "Destination of this bus time..."
                    }
                ]
            }
    """
    stop_times = stop.getStopTimesByStopId(stop_id)
    stop_info = stop.getStopInformation(stop_id)
    additional_stops = stop.hasMultipleRoutes(stop_id, stop_info)

    result = {
        'info': {
            'id': stop_id,
            'stop_code': stop_info['code'],
            'stop_name': stop_info['name'],
            'lat': float(stop_info['lat']),
            'lon': float(stop_info['lon']),
            'status': 200,
            'routes': len(stop_times),
            'hasAdditionalStops': additional_stops
        },
        'routes': stop_times
    }

    resp = Response(json.dumps(result), status=200, mimetype='application/json')
    return resp

@app.route('/api/search/text/<string:query>', methods=['GET', 'POST'])
def text_search(query):
    """
        Returns JSON with the results of this text search query in form:
            {
                "info": {
                    "results": "Number of search results returned."
                },
                results: [List of stop result]
            }

        A stop result is in the following form:
            {
                "id": "Unique id of this stop",
                "routes": "List of route numbers that arrive at this stop",
                "stop_code": "Four digit stop identifier",
                "stop_name": "Name of this stop"
            }
    """
    query = urllib2.unquote(query)

    searchResults = None
    if re.match('^[0-9]{4}$', query):
        searchResults = search.searchByStopCode(query)
    else:
        searchResults = search.searchByStopName(query, 10)

    result = {
        'info': {
            'status': 200,
            'results': len(searchResults)
        },
        'results': searchResults
    }

    resp = Response(json.dumps(result), status=200, mimetype='application/json')
    return resp

@app.route('/api/search/geo/<string:query>', methods=['GET', 'POST'])
def geo_search(query):
    """
        Returns JSON with the results of this geolocation search query in form:
            {
                "info": {
                    "results": "Number of search results returned."
                },
                results: [List of stop result]
            }

        A stop result is in the following form:
            {
                "id": "Unique id of this stop",
                "routes": "List of route numbers that arrive at this stop",
                "stop_code": "Four digit stop identifier",
                "stop_name": "Name of this stop"
            }
    """
    query = urllib2.unquote(query).split('|')
    searchResults = search.searchByLatLon(query[0], query[1], 10)

    result = {
        'info': {
            'status': 200,
            'results': len(searchResults)
        },
        'results': searchResults
    }

    resp = Response(json.dumps(result), status=200, mimetype='application/json')
    return resp

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
    app.run(host='0.0.0.0', port=port, debug=True)