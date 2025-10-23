from flask import Blueprint

api = Blueprint('api', __name__)

# Import the routes to register them with the blueprint
# This is done at the bottom to avoid circular dependencies.
from . import projects, scripts, git_vc, parser