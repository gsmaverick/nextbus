import os
from flask import send_from_directory, current_app, Response

def icon():
    """
        Serves up the touch icon that is requested by mobile browsers for
        bookmarking on home screens and browsers.
    """
    return send_from_directory(os.path.join(current_app.root_path, 'static'),
        'img/apple-touch-icon.png', mimetype='image/png')

def favicon():
    """
        Serves up the favicon from the static files directory.
    """
    return send_from_directory(os.path.join(current_app.root_path, 'static'),
        'favicon.ico', mimetype='image/vnd.microsoft.icon')

def manifest():
    """
        Delivers the cache manifest for local file caching for the application.
        This action is disabled in development environments.
    """
    if os.environ.get('ENVIRONMENT_TYPE', 'dev') == 'dev':
        return Response('', status=404, mimetype='text/html')

    return send_from_directory(os.path.join(current_app.root_path, 'static'),
        'cache.manifest', mimetype='text/cache-manifest')