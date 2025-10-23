import datetime
from . import db

class ScriptFile(db.Document):
    title = db.StringField(required=True, max_length=128)
    # Relative path of the file within its project's Git repository
    file_path = db.StringField(required=True)
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    
    # Meta dictionary for collection name and ordering
    meta = {
        'collection': 'script_files',
        'ordering': ['-created_at']
    }

class Project(db.Document):
    name = db.StringField(required=True, max_length=128, unique=True)
    description = db.StringField()
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    # Absolute path to the Git repository directory on the file system
    repo_path = db.StringField(required=True, unique=True)
    
    # One-to-many relationship using a list of references
    # PULL: If a ScriptFile is deleted, its reference is pulled from this list.
    script_files = db.ListField(db.ReferenceField(ScriptFile, reverse_delete_rule=db.PULL))
    
    meta = {
        'collection': 'projects',
        'ordering': ['-created_at']
    }