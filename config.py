import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') 
    
    # Base directory for storing project repositories
    PROJECTS_DATA_PATH = os.path.join(basedir, 'data', 'projects')
    
    @staticmethod
    def init_app(app):
        # Create the projects data path if it doesn't exist
        os.makedirs(app.config['PROJECTS_DATA_PATH'], exist_ok=True)

class DevelopmentConfig(Config):
    DEBUG = True
    MONGODB_SETTINGS = {
        'db': 'scriptforge_dev',
        'host': 'mongodb://localhost:27017/scriptforge_dev'
    }

class TestingConfig(Config):
    TESTING = True
    # In-memory MongoDB for testing
    MONGODB_SETTINGS = {
        'db': 'scriptforge_test',
        'host': 'mongomock://localhost'
    }
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    # Retrieve the sensitive database URL from environment variables
    MONGODB_SETTINGS = {
        'host': os.environ.get('DATABASE_URL')
    }
    # Add other production-specific settings here

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}







