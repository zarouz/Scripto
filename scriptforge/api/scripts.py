import os
import re
import shutil
from flask import jsonify, request, abort

from . import api
from ..models import Project, ScriptFile

def slugify(text):
    """A simple function to convert a string into a URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text).strip('-')
    return text

def get_full_path(script_file):
    """Helper function to find the full, absolute path of a script file."""
    project = Project.objects(script_files=script_file).first()
    if not project:
        return None
    return os.path.join(project.repo_path, script_file.file_path)

@api.route('/projects/<string:project_id>/scripts', methods=['GET'])
def get_scripts_for_project(project_id):
    """Gets all script files associated with a project."""
    project = Project.objects.get_or_404(id=project_id)
    script_list = [
        {"id": str(script.id), "title": script.title, "file_path": script.file_path}
        for script in project.script_files
    ]
    return jsonify(script_list)

@api.route('/projects/<string:project_id>/scripts', methods=['POST'])
def create_script(project_id):
    """Creates a new script file within a project."""
    project = Project.objects.get_or_404(id=project_id)
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Script title is required'}), 400
    
    title = data.get('title')
    filename = slugify(title) + ".fountain"
    full_path = os.path.join(project.repo_path, filename)
    
    if os.path.exists(full_path):
        return jsonify({'error': f'A script with the filename "{filename}" already exists.'}), 409

    try:
        with open(full_path, 'w') as f:
            initial_content = f"Title: {title.upper()}\n\nINT. SCENE - DAY\n\n"
            f.write(initial_content)
    except Exception as e:
        return jsonify({'error': f'Failed to create script file on disk: {e}'}), 500
        
    script_file = ScriptFile(title=title, file_path=filename)
    script_file.save()
    
    project.script_files.append(script_file)
    project.save()
    
    response_data = {
        "id": str(script_file.id), "title": script_file.title,
        "file_path": script_file.file_path, "project_id": str(project.id)
    }
    return jsonify(response_data), 201

@api.route('/scripts/<string:script_id>', methods=['GET'])
def get_script_content(script_id):
    """Reads and returns the content of a specific script file."""
    script_file = ScriptFile.objects.get_or_404(id=script_id)
    full_path = get_full_path(script_file)
    
    if not full_path or not os.path.exists(full_path):
        abort(404, description="Script file not found on disk.")
        
    try:
        with open(full_path, 'r') as f:
            content = f.read()
        return jsonify({'id': str(script_file.id), 'title': script_file.title, 'content': content})
    except Exception as e:
        return jsonify({'error': f'Could not read file: {e}'}), 500

@api.route('/scripts/<string:script_id>', methods=['PUT'])
def update_script_content(script_id):
    """Overwrites the script file with new content."""
    script_file = ScriptFile.objects.get_or_404(id=script_id)
    full_path = get_full_path(script_file)

    if not full_path:
         abort(404, description="Script file not found on disk.")

    data = request.get_json()
    if data is None or 'content' not in data:
        return jsonify({'error': 'Request body must contain "content" key.'}), 400

    try:
        with open(full_path, 'w') as f:
            f.write(data['content'])
        return jsonify({'status': 'success', 'message': f'File {script_file.file_path} saved.'})
    except Exception as e:
        return jsonify({'error': f'Could not write to file: {e}'}), 500

# 👇 ADD THIS NEW DELETE ROUTE FOR SCRIPTS
@api.route('/scripts/<string:script_id>', methods=['DELETE'])
def delete_script(script_id):
    """Deletes a script file and its database record."""
    script_file = ScriptFile.objects.get_or_404(id=script_id)
    full_path = get_full_path(script_file)
    project = Project.objects(script_files=script_file).first()

    # 1. Delete the file from the filesystem
    if full_path and os.path.exists(full_path):
        try:
            os.remove(full_path)
        except Exception as e:
            return jsonify({'error': f'Failed to delete file on disk: {e}'}), 500

    # 2. Remove the reference from the parent project
    if project:
        project.update(pull__script_files=script_file)

    # 3. Delete the script document itself
    script_file.delete()

    return jsonify({'status': 'success', 'message': 'Script deleted successfully.'}), 200