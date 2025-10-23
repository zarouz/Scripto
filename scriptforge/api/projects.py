import os
import uuid
import shutil
from flask import jsonify, request, current_app
from mongoengine.errors import NotUniqueError

from . import api
from ..models import Project
from ..services.git_service import GitService

@api.route('/projects', methods=['GET'])
def get_projects():
    """Retrieves a list of all projects."""
    projects = Project.objects.all()
    project_list = [{
        "_id": {"$oid": str(p.id)},
        "name": p.name,
        "description": p.description,
        "created_at": {"$date": p.created_at.timestamp() * 1000}
    } for p in projects]
    return jsonify(project_list)

@api.route('/projects', methods=['POST'])
def create_project():
    """Creates a new project."""
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Project name is required'}), 400

    project_name = data.get('name')
    project_uuid = str(uuid.uuid4())
    repo_path = os.path.join(current_app.config['PROJECTS_DATA_PATH'], project_uuid)

    try:
        os.makedirs(repo_path)
        git_service = GitService(repo_path)
        git_service.init_repo()
        
        project = Project(
            name=project_name,
            description=data.get('description', ''),
            repo_path=repo_path
        )
        project.save()
    except NotUniqueError:
        shutil.rmtree(repo_path)
        return jsonify({'error': f'A project with the name "{project_name}" already exists.'}), 409
    except Exception as e:
        shutil.rmtree(repo_path)
        return jsonify({'error': f'Failed to create or save project: {e}'}), 500

    response_data = {
        "id": str(project.id), "name": project.name,
        "description": project.description, "created_at": project.created_at.isoformat()
    }
    return jsonify(response_data), 201

# 👇 ADD THIS NEW DELETE ROUTE FOR PROJECTS
@api.route('/projects/<string:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Deletes a project, its scripts, and its repository folder."""
    project = Project.objects.get_or_404(id=project_id)

    # 1. Delete the entire project directory from the filesystem
    if project.repo_path and os.path.exists(project.repo_path):
        try:
            shutil.rmtree(project.repo_path)
        except Exception as e:
            # Log this error but proceed, as DB cleanup is more critical
            current_app.logger.error(f"Failed to delete directory {project.repo_path}: {e}")

    # 2. Delete all associated script documents
    for script_file in project.script_files:
        script_file.delete()

    # 3. Delete the project document itself
    project.delete()

    return jsonify({'status': 'success', 'message': 'Project deleted successfully.'}), 200