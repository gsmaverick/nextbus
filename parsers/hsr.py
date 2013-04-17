from api import schema, db
from sqlalchemy.exc import DataError, IntegrityError
from transit_base import TransitBase

class HSR(TransitBase):
    def process_stops(self, stops):
        return map(self._stop_dict, stops)

    def populate_stop_times(self):
        services = self.load_csv('calendar.txt')
        routes = self.load_csv('routes.txt')
        trips = self.load_csv('trips.txt')
        times = self.load_csv('stop_times.txt')

        # Turn list of services into a dictionary where each key is a service id.
        services = dict((x['service_id'], x) for x in services)

        # Turn list of routes into a dictionary where each key is a route id.
        routes = dict((x['route_id'], x) for x in routes)

        # Only include trips that are still active.
        trips = filter(lambda x: x['service_id'] in self.trips, trips)

        # Two empty lists that will be populated with data.
        stop_times = []
        conn = db.connect()

        # Not sure why but you have to recopy the entire DictReader list into a
        # native Python list otherwise it won't work for the for loops.
        times = [i for i in times]

        for trip in trips:
            # Retrieve all stop times for this trip.
            stops = [i for i in times if i['trip_id'] == trip['trip_id']]

            for stop in stops:
                route = routes[trip['route_id']]
                service = services[trip['service_id']]

                stop_time = {
                    'stop_id':      stop['stop_id'],
                    'endpoint':     trip['trip_headsign'],
                    'route_name':   route['route_long_name'],
                    'route_number': route['route_short_name'],
                    'stop_time':    stop['departure_time'],
                    'monday': True if service['monday'] == '1' else False,
                    'tuesday': True if service['tuesday'] == '1' else False,
                    'wednesday': True if service['wednesday'] == '1' else False,
                    'thursday': True if service['thursday'] == '1' else False,
                    'friday': True if service['friday'] == '1' else False,
                    'saturday': True if service['saturday'] == '1' else False,
                    'sunday': True if service['sunday'] == '1' else False,
                }

                try:
                    conn.execute(schema.stop_times.insert().values(stop_time))
                except IntegrityError as e:
                    print "Integrity Error for stop time: %s" % (stop_time)