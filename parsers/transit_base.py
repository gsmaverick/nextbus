from csv import DictReader
from datetime import datetime
from api import schema, db
from sqlalchemy.exc import DataError

class TransitBase():
    """
        Base class for building transit data importers for Bus Ticker.  It takes
        care of some common functionality that all importers use.
    """

    def __init__(self, path):
        """
            Sets the base path of the data directory for this transit agency.
        """
        self.path = path

    def load_csv(self, filename):
        """
            :param filename: Name of the file (relative to the class path).

            :returns Each row as a dictionary object.
        """
        csv_file = open(self.path + filename, 'rb')

        return DictReader(csv_file, delimiter=',')

    def determine_valid_trips(self):
        """
            :returns List of all valid trips for this transit agency based on
            the start and end dates.
        """
        today = datetime.utcnow().strftime('%Y%m%d')

        dates = [i for i in self.load_csv('calendar.txt')]

        trips = [date['service_id'] for date in dates
                 if date['start_date'] < today
                 and date['end_date'] > today]

        return trips

    def populate(self):
        self.trips = self.determine_valid_trips()

        self.populate_stops()
        self.populate_stop_times()

    def populate_stops(self):
        """
            Loads all the stops from the data file lets the subclass process
            them and then loads them into the database.
        """
        stops = self.load_csv('stops.txt')
        stops = self.process_stops(stops)

        connection = db.connect()
        for stop in stops:
            try:
                connection.execute(schema.stops.insert(), stop)
            except DataError:
                print "Missing data for stop: %s" % (stop)

    def _stop_dict(self, stop):
        """
            :returns Dictionary with the proper field names that match up with
            the database schema.
        """
        return {
            'id': stop.get('stop_id'),
            'code': stop.get('stop_code', None),
            'name': stop.get('stop_name'),
            'lat': stop.get('stop_lat'),
            'lon': stop.get('stop_lon')
        }