import sys, time, urllib2, os, re
from flask import Flask, jsonify, Response, render_template, json, send_from_directory, request
from twilio.rest import TwilioRestClient
from api import schema, search, stop

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('marketing.html')

@app.route('/app')
@app.route('/app/stop/<int:stop_id>')
def app_home(stop_id=0):
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

@app.route('/api/search/text/<string:query>', methods=['GET', 'POST'])
def do_search(query):
    query = urllib2.unquote(query)
    result = search.searchByStopName(query, 10)

    resp = Response(json.dumps(result), status=200, mimetype='application/json')
    return resp

@app.route('/api/search/geo/<string:query>', methods=['GET', 'POST'])
def do_geo_search(query):
    query = urllib2.unquote(query).split('|')
    result = search.searchByLatLon(query[0], query[1])

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
    return render_template('help.html', header=True)

"""
    GET /about
"""
@app.route('/about', methods=['GET'])
def show_about():
    """
        Main entry point of the application for mobile and desktop users.  We detect
        if a mobile phone is in use and serve up the mobile version instead.
    """
    return render_template('about.html', header=True)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/send_to_phone', methods=['POST'])
def send_to_phone():
    message = 'Find next bus times by going to http://www.thenextbusapp.com'
    account = os.environ.get('TWILIO_ACCOUNT_SID')
    token = os.environ.get('TWILIO_AUTH_TOKEN')
    client = TwilioRestClient(account, token)

    number = request.form['number'].strip('()-')
    error = None
    sms = None

    # Match only numbers with 10 or 11 digits.  Otherwise throw an error.
    if re.match('^[0-9]{10,11}$', number):
        sms = client.sms.messages.create(
            to=number,
            from_='12892041646',
            body=message)
    else:
        error = 'Invalid phone number.'

    if sms.status == 'failed':
        error = 'Message failed to send, please try again.'

    result = {
        'status': 'error' if error else 'success',
        'text': error if error else 'Successfully sent message.'
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