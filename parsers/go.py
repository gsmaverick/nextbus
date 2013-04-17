from api import schema, db
from sqlalchemy.exc import DataError, IntegrityError
from transit_base import TransitBase

class GO(TransitBase):
    hamilton_stops = [
        '00310', '02185', '01010', '00179', '01009', '01008', '01013',
        '01011', '01012', '01007', '01014', '00178', '01005', '01004',
        '01003', '01001', '01006', '01002', '00351', '00141', '09181',
        '09181-1'
    ]

    def process_stops(self, stops):
        # GO Transit services the GTA but for Bus Ticker we only want to import
        # the trips that stop in Hamilton.
        stops = [s for s in stops if s['stop_id'] in self.hamilton_stops]

        for stop in stops:
            stop['stop_id'] = 'go-' + stop['stop_id']

        return map(self._stop_dict, stops)

    def colours(self, dirname):
        self.trips = self.determine_valid_trips()

        trips = self.load_csv('trips.txt')
        routes = self.load_csv('routes.txt')

        # Turn list of routes into a dictionary where each key is a route id.
        routes = dict((x['route_id'], x) for x in routes)

        trips = self._filter_trips(trips)

        route_details = {}

        for trip in trips:
            route = routes[trip['route_id']]

            if route['route_type'] == '2':
                continue

            number = trip['trip_headsign'].split('-')[0].strip()

            route_details[number] = routes[trip['route_id']]['route_color']

        with open(dirname + '/Source/Sass/application/go.scss', 'wb') as f:
            for key, value in route_details.iteritems():
                sassRule =  '''
.route-go-{0} {{
    background: #{1};
    box-shadow: inset 0 0 1px 1px darken(#{1}, 10%);
    text-shadow: 0 0 1px darken(#{1}, 30%);
    color: #000000;
}}
'''
                valTuple = (key, value)
                f.write(sassRule.format(*valTuple))


    def _filter_trips(self, trips):
        # Only include trips that are still active.
        trips = filter(lambda x: x['service_id'] in self.trips, trips)

        # Filter out inbound trips.
        trips = filter(lambda x: x['direction_id'] is '0', trips)

        return trips

    def populate_stop_times(self):
        services = self.load_csv('calendar.txt')
        routes = self.load_csv('routes.txt')
        trips = self.load_csv('trips.txt')
        times = self.load_csv('stop_times.txt')

        # Turn list of services into a dictionary where each key is a service id.
        services = dict((x['service_id'], x) for x in services)

        # Turn list of routes into a dictionary where each key is a route id.
        routes = dict((x['route_id'], x) for x in routes)

        trips = self._filter_trips(trips)

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
                if stop['stop_id'] not in self.hamilton_stops:
                    continue

                route = routes[trip['route_id']]
                service = services[trip['service_id']]

                if route['route_type'] == '2':
                    continue

                if trip['trip_headsign'].split('-')[0].strip() == '8G':
                    print trip['trip_headsign']

                stop_time = {
                    'stop_id':      'go-' + stop['stop_id'],
                    'endpoint':     trip['trip_headsign'], #.split('-')[1].strip(),
                    'route_name':   route['route_long_name'],
                    'route_number': trip['trip_headsign'].split('-')[0].strip(),
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