from sqlalchemy import select, and_
from . import db, schema, easternTime

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

def _getStopTimesForRouteStop(route, after_time, conn, num=5):
    """
        Returns an object with the route information and a list containing the
        next 5 stop times at this stop_id for this route.

        :param route: Row from the database referencing this route.
        :param after_time: The time after which the stops should occur.
        :param conn: Database connection to use.
        :param num: Number of stop times to return.
    """
    _days = [
        'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
    ]
    today = _days[int(easternTime().strftime('%w'))]
    tomorrow = _days[(int(easternTime().strftime('%w')) + 1) % 7]

    times_query = select(
        [schema.stop_times.c.stop_time, schema.stop_times.c.endpoint],
        and_(
            schema.stop_times.c.stop_id == route['stop_id'],
            schema.stop_times.c.route_name == route['route_name'],
            schema.stop_times.c.stop_time > after_time,
            schema.stop_times.c[today] == True
        )
    ).order_by(schema.stop_times.c.stop_time.asc()).limit(num)

    # Get the first five after the new day has dawned just in case less than
    # `num` stops are left in the current day.
    secondary_query = select(
        [schema.stop_times.c.stop_time, schema.stop_times.c.endpoint],
        and_(
            schema.stop_times.c.stop_id == route['stop_id'],
            schema.stop_times.c.route_name == route['route_name'],
            schema.stop_times.c[tomorrow] == True
        )
    ).order_by(schema.stop_times.c.stop_time.asc()).limit(num)

    times_result = conn.execute(times_query).fetchall()
    secondary_result = conn.execute(secondary_query).fetchall()

    times     = [_zipRow(t) for t in times_result]
    secondary = [_addDayToArrivalTime(_zipRow(t)) for t in secondary_result]
    stop_times = (times + secondary)[:5]

    if len(stop_times) == 0:
        return None

    return {
        'name': route['route_name'],
        'number': route['route_number'],
        'times': stop_times
    }

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