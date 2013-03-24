from datetime import datetime, timedelta
from flask import Response

def makeJSONResponse(json, expires={}):
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