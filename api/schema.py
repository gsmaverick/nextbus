"""
    schema.py - Table definitions for the PostgreSQL database.

    All tables used in the application are defined in this file.  Each table
    definition is expressed through SQLAlchemy's Data Definition Language.
"""
from sqlalchemy import *
from . import db

_metadata = MetaData()

# This table stores all the stops in the system and is used primarily to power
# the stop search functionality.
stops = Table('stops', _metadata,
    Column('id', Integer, primary_key=True),
    Column('code', Integer, nullable=False),
    Column('name', String, nullable=False),
    Column('lat', Numeric, nullable=False),
    Column('lon', Numeric, nullable=False)
)


# This table stores a product of all stops and the times at which a bus arrives
# at that particular stop.
stop_times = Table('stop_times', _metadata,
    Column('stop_id', Integer, ForeignKey('stops.id')),
    Column('route_name', String, nullable=False),
    Column('route_number', Integer, nullable=False),
    Column('stop_time', String, nullable=False),
    Column('endpoint', String, nullable=False),
    Column('monday', Boolean, ColumnDefault(False)),
    Column('tuesday', Boolean, ColumnDefault(False)),
    Column('wednesday', Boolean, ColumnDefault(False)),
    Column('thursday', Boolean, ColumnDefault(False)),
    Column('friday', Boolean, ColumnDefault(False)),
    Column('saturday', Boolean, ColumnDefault(False)),
    Column('sunday', Boolean, ColumnDefault(False))
)

# Initializes the schema in the database by wiping out previous tables and
# recreating the structure as defined in this file.
def create_schema():
    _metadata.drop_all(db)
    _metadata.create_all(db)