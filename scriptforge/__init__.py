from flask import Flask
from flask_mongoengine import MongoEngine
from flask_cors import CORS
from config import config

# Initialize extensions, but do not bind them to an app yet
db = MongoEngine()

def create_app(config_name='default'):
    """
    Application factory function.
    """
    app = Flask(__name__, instance_relative_config=True)
    
    # Load configuration from config.py
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Load configuration from instance/config.py if it exists
    app.config.from_pyfile('config.py', silent=True)
    
    # Initialize extensions with the app instance
    db.init_app(app)
    
    # Enable CORS for the API, allowing the frontend to make requests.
    # In production, this should be configured more securely.
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api/v1')
    
    return app