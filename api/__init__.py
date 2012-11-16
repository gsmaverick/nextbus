# This package defines the API used to access the underlying datastore to power
# the NextBus service.

__version__ = '1.0.0'
__all__ = ['schema', 'search', 'stop']

from sqlalchemy import create_engine

import settings

def create_db(config):
    """
        Returns a SQLAlchemy database engine instance based on the given config
        parameters.

        :param config: Dict of config options for initializing the database.
    """

    return create_engine(
        'postgresql://' + config['user'] + ':' + config['password'] + '@' +
        config['host'] + ':' + config['port'] + '/' + config['database']
    )

# Define a common database connection which can be used for an api method.
db = create_db(settings.DATABASE['LOCAL'])