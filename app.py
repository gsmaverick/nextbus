import sys, time, urllib2, os
from flask import Flask, jsonify, Response, render_template, json
from api import schema, search, stop

app = Flask(__name__)

@app.route('/')
@app.route('/stop/<int:stop_id>')
def index(stop_id=0):
    """
        Main entry point of the application for mobile and desktop users.  We detect
        if a mobile phone is in use and serve up the mobile version instead.
    """
    t = int(time.time())
    return render_template('index.html', t=t)

@app.route('/api/stops/<int:stop_code>', methods=['GET'])
def show_stop(stop_code):
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
    stop_times = stop.getStopTimesByCode(stop_code)
    stop_info = stop.getStopInformation(stop_code)

    result = {
        'info': {
            'stop_id': stop_info['code'],
            'stop_name': stop_info['name'],
            'status': 200,
            'routes': len(stop_times)
        },
        'routes': stop_times
    }

    resp = Response(json.dumps(result), status=200, mimetype='application/json')
    return resp

@app.route('/api/search/<string:query>', methods=['GET', 'POST'])
def do_search(query):
    query = urllib2.unquote(query)
    result = search.searchByStopName(query, 10)

    resp = Response(json.dumps(result), status=200, mimetype='application/json')
    return resp

"""
    GET /about/help
"""
@app.route('/help', methods=['GET'])
def show_help():
    """
        Main entry point of the application for mobile and desktop users.  We detect
        if a mobile phone is in use and serve up the mobile version instead.
    """
    return render_template('help.html')

"""
    GET /about
"""
@app.route('/about', methods=['GET'])
def show_about():
    """
        Main entry point of the application for mobile and desktop users.  We detect
        if a mobile phone is in use and serve up the mobile version instead.
    """
    return render_template('about.html')

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)