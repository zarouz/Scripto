import git
import os
from datetime import datetime

class GitService:
    def __init__(self, repo_path):
        """
        Initializes the GitService. Does not raise an error if the path
        is not a repo, as it might be initialized later.
        """
        self.repo_path = repo_path
        if os.path.isdir(os.path.join(self.repo_path, '.git')):
            try:
                self.repo = git.Repo(self.repo_path)
            except git.exc.GitError:
                self.repo = None
        else:
            self.repo = None

    def init_repo(self):
        """Initializes a new Git repository at the specified path."""
        if self.repo is None and os.path.isdir(self.repo_path):
            self.repo = git.Repo.init(self.repo_path)
            return True
        return False

    def get_status(self):
        """Gets the status of the repository."""
        if self.repo is None:
            return None

        has_commits = False
        try:
            self.repo.head.commit
            has_commits = True
        except ValueError:
            has_commits = False

        staged_files = []
        if has_commits:
            staged_files = [item.a_path for item in self.repo.index.diff('HEAD')]
        
        return {
            'is_dirty': self.repo.is_dirty(untracked_files=True),
            'untracked_files': self.repo.untracked_files,
            'modified_files': [item.a_path for item in self.repo.index.diff(None)],
            'staged_files': staged_files
        }

    def stage_files(self, file_paths: list):
        """Stages a list of files."""
        if self.repo:
            self.repo.index.add(file_paths)
            return True
        return False

    def commit(self, message: str):
        """Commits staged changes with a given message."""
        if not self.repo:
            return False

        has_staged_changes = False
        try:
            if self.repo.index.diff('HEAD'):
                has_staged_changes = True
        except git.exc.BadName:
            if self.repo.index.entries:
                has_staged_changes = True

        if has_staged_changes:
            self.repo.index.commit(message)
            return True
        
        return False

    def get_history(self, max_count=50):
        """Gets the commit history for the repository."""
        if self.repo is None:
            return []
            
        commits = list(self.repo.iter_commits('master', max_count=max_count))
        history = []
        for commit in commits:
            history.append({
                'sha': commit.hexsha,
                'message': commit.message.strip(),
                'author': commit.author.name,
                'date': datetime.fromtimestamp(commit.authored_date).isoformat()
            })
        return history

    def get_file_content_at_commit(self, file_path, commit_sha):
        """Retrieves the content of a file at a specific commit."""
        if self.repo is None:
            return None
            
        try:
            commit = self.repo.commit(commit_sha)
            blob = commit.tree / file_path
            return blob.data_stream.read().decode('utf-8')
        except (KeyError, git.exc.GitCommandError):
            return None