import utils
from api import *
from flask import json, request

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

    result = json.dumps({
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
    })

    return utils.json_response(result)

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

    result = json.dumps({
        'info': {
            'status': 200,
            'results': len(searchResults)
        },
        'results': searchResults
    })

    return utils.json_response(result, {'days': 7})

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

    result = json.dumps({
        'info': {
            'status': 200,
            'results': len(searchResults)
        },
        'results': searchResults
    })

    return utils.json_response(result, {'days': 7})

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

    return utils.json_response(json.dumps(result))