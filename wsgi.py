import os
from scriptforge import create_app

# Use the 'default' config unless FLASK_CONFIG is set
config_name = os.getenv('FLASK_CONFIG') or 'default'
app = create_app(config_name)

if __name__ == '__main__':
    app.run()