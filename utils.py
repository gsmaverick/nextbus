from datetime import datetime, timedelta
from flask import Response

def json_response(json, expires={}):
    """
        Creates a response object that contains JSON data.

        :param json: Data in JSON format to put in response.
        :param expires: Number of seconds in the future to expire this request.
    """
    delta = datetime.utcnow() + timedelta(**expires)

    requestHeaders = {
        'Cache-Control': 'public',
        'Expires': delta.strftime('%a, %d %b %Y %H:%M:%S GMT')
    }

    return Response(json, status=200, mimetype='application/json',
        headers=requestHeaders)

def set_urls(app, routes):
    """
        Connects url patterns to actions for the `app`.
    """
    for rule in routes:
        if len(rule) == 3: rule = rule + ({}, )

        url_rule, endpoint, view_func, opts = rule
        app.add_url_rule(url_rule, endpoint=endpoint, view_func=view_func, **opts)