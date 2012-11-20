import time
from sqlalchemy import *
from . import db, schema

def searchByLatLon(lat, lon, num=5):
    """
        Search for a stop that is closest to the supplied latitude and longitude
        coordinates.  Returns an array of stops that are nearby with names and
        stop codes for each one.

        :param lat: Latitude coordinate to search near.
        :param lon: Longitude coordinate to search near.
        :param num: The number of possible nearby stops to return.
    """
    conn = db.connect()

    query = text('\
        SELECT * FROM \
            (SELECT id, name, code, lat, lon, \
                (6371 * acos(cos(radians(:lat)) * cos(radians(lat)) * \
                                     cos(radians(lon) - radians(:lon)) + \
                                     sin(radians(:lat)) * sin(radians(lat)))) \
        AS distance \
        FROM stops) AS distances \
        WHERE distance < 5 \
        ORDER BY distance \
        OFFSET 0 LIMIT :limit'
    )

    result = conn.execute(query, lat=lat, lon=lon, limit=num)

    return [_stopNameResultDict(s, conn) for s in result]

def searchByStopCode(code):
    """
        Search for stops that have the given stop code.

        :param name: Stop code to search for.
    """
    conn = db.connect()

    query = select([schema.stops], schema.stops.c.code == code)
    result = conn.execute(query).fetchall()

    return [_stopNameResultDict(s, conn) for s in result]

def searchByStopName(name, num=25):
    """
        Search for a stop that is closest to the specified stop name.

        :param name: Stop name to search for.
    """
    conn = db.connect()

    match_expr = _createRegexFromQuery(name)

    query = select([schema.stops],
        schema.stops.c.name.op('~*')(match_expr)).limit(num)
    result = conn.execute(query).fetchall()

    return [_stopNameResultDict(s, conn) for s in result]

def _createRegexFromQuery(query):
    """
        Create a POSIX regular expression to match .

        :param query: Query to construct a regular expression matcher for.
    """
    terms = query.split(' ')
    terms = [q for q in terms if _validSearchTerm(q) is not None]

    # Match each term (lowercased) with arbitrary chars on either side.
    matchers = '|'.join(['((.*)%s(.*))' % t.lower() for t in terms])

    expr = '(%s){%d}' % (matchers, len(terms))

    return expr

def _validSearchTerm(term):
    """
        Determines if the given term is useful for searching stop names in the
        database.  The list of strings, in the body of this function, consists
        of strings that occur very commonly in stop names and so they are
        removed because they are too common to be useful in searching.

        :param term: The string to check for validity.
    """
    removed = ['&', 'opposite', 'at', 'and']

    return None if term.lower() in removed else term

def _stopNameResultDict(stop, conn):
    """
        Returns a dictionary for a stop name search result.

        :param stop: Stop result row from the database query.
    """
    return {
        'id': stop['id'],
        'stop_code': stop['code'],
        'stop_name': stop['name'],
        'routes': _routesForStopId(stop['id'], conn)
    }

def _routesForStopId(stop_id, conn):
    """
        Find all routes that stop at a given stop id.  Returns the list of route
        numbers at this stop.

        :param stop_id: Stop id for which to aggregate routes.
    """
    routes_query = select(
        [schema.stop_times.c.route_number],
        schema.stop_times.c.stop_id == stop_id
    ).distinct(schema.stop_times.c.route_number)
    result = conn.execute(routes_query).fetchall()

    return [r[0] for r in result]