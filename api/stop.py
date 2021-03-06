from sqlalchemy import select, and_
from . import db, schema, easternTime

# Column names for each of the days of the week in the database.
_days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

def getStopInformation(stop_id):
    """
        Returns a dictionary containing all the information regarding the stop
        id.  This includes latitude, longitude and the stop name.

        :param stop_id: ID value that identifies this stop.
    """
    conn = db.connect()

    query = select([schema.stops], schema.stops.c.id == stop_id)
    result = conn.execute(query).fetchone()

    stop = dict(zip(result.keys(), result))

    return stop

def getStopTimesByStopId(stop_id):
    """
        Returns a list of routes along with the next times that the bus stops at
        this stop.

        :param stop_id: ID value that identifies this stop.
    """
    conn = db.connect()

    # Find all routes that stop at this stop_code.
    query = select(
        [
            schema.stop_times.c.route_name,
            schema.stop_times.c.stop_id,
            schema.stop_times.c.route_number
        ],
        schema.stop_times.c.stop_id == stop_id
    ).distinct(schema.stop_times.c.route_name)
    result = conn.execute(query)

    # For each (stop id, route) recover the stop times after this point in time.
    current_time = easternTime().strftime('%H:%M:%S')

    routes = [_getStopTimesForRouteStop(r, current_time, conn) for r in result]

    # _getStopTimesForRouteStop returns None for routes that have no arrival
    # times in the next 2 days so they need to be filtered out.
    routes = [r for r in routes if r is not None]

    # Sort routes by the time until their first stop.
    routes.sort(key=lambda r: r['times'][0]['stop_time'])

    return routes

def hasMultipleRoutes(stop_id, stop_info):
    """
        Checks whether the stop name referred to by the stop has other route
        stops.  Returns False if this is the only stop_id at the stop name True
        otherwise.

        :param stop_id: Stop id for the requested stop.
        :param stop_info: Dict of stop info as returned from getStopInformation.
    """
    conn = db.connect()

    query = select([schema.stops.c.id], and_(
            schema.stops.c.name == stop_info['name'],
            schema.stops.c.id != stop_id
    ))

    first = conn.execute(query).fetchone()

    return first is not None



def _getStopTimesForRouteStop(route, after_time, conn, num=5):
    """
        Returns an object with the route information and a list containing the
        next 5 stop times at this stop_id for this route.

        :param route: Row from the database referencing this route.
        :param after_time: The time after which the stops should occur.
        :param conn: Database connection to use.
        :param num: Number of stop times to return.
    """
    today = _days[int(easternTime().strftime('%w'))]
    tomorrow = _days[(int(easternTime().strftime('%w')) + 1) % 7]

    times = _stopTimesForDay(route, today, after_time, conn, num)

    stop_times = [_zipRow(t) for t in times]

    # If there aren't enough stop times today then try and backfill with stop
    # times from tomorrow.
    if len(stop_times) < num:
        times = _stopTimesForDay(route, tomorrow, '00:00:00', conn, num)
        secondary = [_addDayToArrivalTime(_zipRow(t)) for t in times]

        stop_times = (stop_times + secondary)[:num]

    if len(stop_times) == 0:
        return None

    return {
        'name': route['route_name'],
        'number': route['route_number'],
        'times': stop_times
    }

def _stopTimesForDay(route, day, after_time, conn, num=5):
    """
        Returns all stop times for this route object on the given day and time.

        :param route: Route row object from the database.
        :param day: Which day of the week to find stops for.
        :param conn: Database connection object
        :param num: Number of results to return
    """
    query = select(
        [schema.stop_times.c.stop_time, schema.stop_times.c.endpoint],
        and_(
            schema.stop_times.c.stop_id == route['stop_id'],
            schema.stop_times.c.route_name == route['route_name'],
            schema.stop_times.c.stop_time > after_time,
            schema.stop_times.c[day] == True
        )
    ).order_by(schema.stop_times.c.stop_time.asc()).limit(num)

    return conn.execute(query).fetchall()

def _addDayToArrivalTime(stop_time):
    """
        Takes a stop_time row from the database and adds 24 hours to the stop
        time.

        :param stop_time: Row from stop_times table that has a stop_time.
    """

    hours = str(int(stop_time['stop_time'][:2]) + 24)
    stop_time['stop_time'] = hours + stop_time['stop_time'][2:]

    return stop_time

def _zipRow(row):
    """
        Returns a python dictionary from a row returned from a database query.

        :param row: Row result returned from a database query.
    """

    return dict(zip(row.keys(), row))