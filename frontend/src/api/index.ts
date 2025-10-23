const API_BASE_URL = 'http://localhost:5000/api/v1';

// --- Interfaces (no changes) --- //
export interface Project { id: string; name: string; description: string; createdAt: string; }
export interface ScriptContent { id: string; title: string; content: string; }
export interface Script { id: string; title: string; file_path: string; }
interface BackendProject { _id: { $oid: string }; name: string; description: string; created_at: { $date: number }; }

// --- API Fetch Helper (no changes) --- //
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'API call failed' }));
        throw new Error(errorBody.error || `API call failed: ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json() as Promise<T>;
    }
    return undefined as T;
}

// --- Project API Functions --- //
export const getProjects = async (): Promise<Project[]> => {
    const backendProjects = await apiFetch<BackendProject[]>('/projects');
    return backendProjects.map(p => ({
        id: p._id.$oid,
        name: p.name,
        description: p.description,
        createdAt: new Date(p.created_at.$date).toISOString(),
    }));
};
export const createProject = async (name: string, description: string = ''): Promise<Project> => {
    const newBackendProject = await apiFetch<any>('/projects', { method: 'POST', body: JSON.stringify({ name, description }), });
    return { id: newBackendProject.id, name: newBackendProject.name, description: newBackendProject.description, createdAt: newBackendProject.created_at, };
};
// 👇 ADD THIS NEW FUNCTION
export const deleteProject = (projectId: string): Promise<void> => {
    return apiFetch<void>(`/projects/${projectId}`, { method: 'DELETE' });
};


// --- Script API Functions --- //
export const getScriptsForProject = (projectId: string): Promise<Script[]> => apiFetch<Script[]>(`/projects/${projectId}/scripts`);
export const getScriptContent = (scriptId: string): Promise<ScriptContent> => apiFetch<ScriptContent>(`/scripts/${scriptId}`);
export const updateScriptContent = (scriptId: string, content: string): Promise<void> => apiFetch<void>(`/scripts/${scriptId}`, { method: 'PUT', body: JSON.stringify({ content }), });
export const createScript = (projectId: string, title: string): Promise<Script> => apiFetch<Script>(`/projects/${projectId}/scripts`, { method: 'POST', body: JSON.stringify({ title }), });
// 👇 ADD THIS NEW FUNCTION
export const deleteScript = (scriptId: string): Promise<void> => {
    return apiFetch<void>(`/scripts/${scriptId}`, { method: 'DELETE' });
};