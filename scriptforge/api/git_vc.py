from flask import jsonify, request, abort
from . import api
from ..models import Project
from ..services.git_service import GitService

@api.route('/projects/<string:id>/git/status', methods=['GET'])
def get_git_status(id):
    """Gets the Git status for a project's repository."""
    project = Project.objects.get_or_404(id=id)
    git_service = GitService(project.repo_path)
    
    status = git_service.get_status()
    if status is None:
        abort(500, description="Repository not found or initialized.")
        
    return jsonify(status)

@api.route('/projects/<string:id>/git/stage', methods=['POST'])
def stage_files(id):
    """Stages specified files in the project's repository."""
    project = Project.objects.get_or_404(id=id)
    data = request.get_json()
    files_to_stage = data.get('files')

    if not files_to_stage or not isinstance(files_to_stage, list):
        return jsonify({'error': 'A list of files to stage is required.'}), 400
        
    git_service = GitService(project.repo_path)
    if git_service.stage_files(files_to_stage):
        return jsonify({'status': 'success', 'staged_files': files_to_stage})
    else:
        return jsonify({'error': 'Failed to stage files.'}), 500

@api.route('/projects/<string:id>/git/commit', methods=['POST'])
def commit_changes(id):
    """Commits staged changes in the project's repository."""
    project = Project.objects.get_or_404(id=id)
    data = request.get_json()
    message = data.get('message')

    if not message:
        return jsonify({'error': 'A commit message is required.'}), 400
        
    git_service = GitService(project.repo_path)
    if git_service.commit(message):
        # We can get the latest commit details to return
        latest_commit = git_service.get_history(max_count=1)[0]
        return jsonify({'status': 'success', 'commit': latest_commit}), 201
    else:
        return jsonify({'status': 'no_changes', 'message': 'No staged changes to commit.'}), 200

@api.route('/projects/<string:id>/git/history', methods=['GET'])
def get_commit_history(id):
    """Retrieves the commit history for the project's repository."""
    project = Project.objects.get_or_404(id=id)
    git_service = GitService(project.repo_path)
    history = git_service.get_history()
    return jsonify(history)