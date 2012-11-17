# This package defines the API used to access the underlying datastore to power
# the NextBus service.

__version__ = '1.0.0'
__all__ = ['schema', 'search', 'stop']

import os
from sqlalchemy import create_engine

def create_db():
    """
        Returns a SQLAlchemy database engine instance based on a default local
        database connection string or the environment database connection.
    """

    db_url = os.environ.get('HEROKU_POSTGRESQL_GRAY_URL', 'postgresql://postgres:admin@127.0.0.1:5432/nextbus')

    return create_engine(db_url)

# Define a common database connection which can be used for an api method.
db = create_db()