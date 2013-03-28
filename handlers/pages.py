import re, os, time
from flask import request, render_template

def about():
    """
        Renders a static about page.
    """
    return render_template('about.html', header=True)

def app():
    """
        Renders the application template directly for debugging and issues
        where the user agent isn't properly recognized.
    """
    env = os.environ.get('ENVIRONMENT_TYPE', 'prod')

    current_time = int(time.time()) if env == 'dev' else None

    return render_template('index.html', invalidate=current_time)

def help():
    """
        Renders a static help page.
    """
    return render_template('help.html', header=True)

def index():
    """
        The style of the index page served up depends on whether the user is
        making a request from a mobile or desktop device.
    """
    user_agent = request.headers.get('User-Agent')
    is_mobile = re.search('android|ipad|iphone', user_agent, re.IGNORECASE)
    tmpl = 'index' if is_mobile else 'marketing'

    return render_template('%s.html' % tmpl)