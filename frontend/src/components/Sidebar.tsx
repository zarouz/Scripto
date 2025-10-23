import { useState, useEffect } from 'react';
import { FolderKanban, Plus, Settings, FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { getProjects, createProject, getScriptsForProject, createScript, deleteProject, deleteScript, Project, Script } from '@/api';

const Sidebar = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [scriptsByProject, setScriptsByProject] = useState<Record<string, Script[]>>({});
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const { projectId, scriptId } = useParams();
    const navigate = useNavigate();

    const fetchProjects = () => {
        setIsLoading(true);
        getProjects()
            .then(setProjects)
            .catch(error => { console.error("Failed to fetch projects:", error); setProjects([]); })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleToggleProject = (id: string) => {
        const newSet = new Set(expandedProjects);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setExpandedProjects(newSet);
        if (newSet.has(id) && !scriptsByProject[id]) {
            getScriptsForProject(id).then(scripts => setScriptsByProject(prev => ({ ...prev, [id]: scripts })));
        }
    };

    const handleCreateProject = async () => {
        const name = prompt("Enter new project name:");
        if (name) {
            try {
                await createProject(name);
                fetchProjects();
            } catch (error) { alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`); }
        }
    };

    const handleCreateScript = async (pId: string) => {
        const title = prompt("Enter new script title:");
        if (title && pId) {
            try {
                // 👇 This is the line that was missing. It calls the backend to create the script.
                await createScript(pId, title);

                // Now, we refetch the scripts for this project to update the UI.
                const scripts = await getScriptsForProject(pId);
                setScriptsByProject(prev => ({ ...prev, [pId]: scripts }));
            } catch (error) {
                alert(`Error creating script: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    };

    const handleDeleteProject = async (pId: string, pName: string) => {
        if (window.confirm(`Are you sure you want to delete the project "${pName}"? This will delete all its scripts and cannot be undone.`)) {
            try {
                await deleteProject(pId);
                setProjects(prev => prev.filter(p => p.id !== pId));
                if (projectId === pId) navigate('/');
            } catch (error) { alert(`Error deleting project: ${error instanceof Error ? error.message : 'Unknown error'}`); }
        }
    };

    const handleDeleteScript = async (sId: string, pId: string) => {
        if (window.confirm("Are you sure you want to delete this script?")) {
            try {
                await deleteScript(sId);
                setScriptsByProject(prev => ({ ...prev, [pId]: prev[pId].filter(s => s.id !== sId) }));
                if (scriptId === sId) navigate(`/projects/${pId}`);
            } catch (error) { alert(`Error deleting script: ${error instanceof Error ? error.message : 'Unknown error'}`); }
        }
    };

    return (
        <aside className="w-72 bg-zinc-800 p-4 flex flex-col border-r border-zinc-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</h2>
                <button onClick={handleCreateProject} className="p-1 text-gray-400 hover:text-white" title="New Project"><Plus size={16} /></button>
            </div>
            <nav className="flex-1 flex flex-col space-y-1 overflow-y-auto">
                {isLoading ? <p className="text-sm text-gray-400">Loading...</p> : projects.map(p => (
                    <div key={p.id} className="group">
                        <div
                            onClick={() => handleToggleProject(p.id)}
                            className={clsx("flex items-center justify-between p-2 text-sm rounded-md cursor-pointer", {
                                "bg-zinc-700": projectId === p.id && !scriptId,
                                "hover:bg-zinc-700": !(projectId === p.id && !scriptId),
                            })}
                        >
                            <div className="flex items-center">
                                {expandedProjects.has(p.id) ? <ChevronDown size={16} className="mr-2" /> : <ChevronRight size={16} className="mr-2" />}
                                <FolderKanban size={16} className="mr-2" />
                                <span className="font-semibold">{p.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button onClick={(e) => { e.stopPropagation(); handleCreateScript(p.id); }} className="p-1 opacity-0 group-hover:opacity-50 hover:!opacity-100" title="New Script"><Plus size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id, p.name); }} className="p-1 text-red-500 opacity-0 group-hover:opacity-50 hover:!opacity-100" title="Delete Project"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        {expandedProjects.has(p.id) && (
                            <div className="pl-6 border-l border-zinc-700 ml-3">
                                {(scriptsByProject[p.id] || []).map(s => (
                                    <div key={s.id} className="group flex items-center justify-between">
                                        <NavLink
                                            to={`/scripts/${s.id}`}
                                            className={({ isActive }) => clsx("flex-1 flex items-center p-2 text-sm rounded-md my-1", {
                                                "bg-blue-600 text-white": isActive,
                                                "text-gray-400 hover:bg-zinc-700": !isActive
                                            })}
                                        >
                                            <FileText size={14} className="mr-2" />
                                            <span>{s.title}</span>
                                        </NavLink>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteScript(s.id, p.id); }} className="p-1 text-red-500 opacity-0 group-hover:opacity-50 hover:!opacity-100" title="Delete Script"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                                {(!scriptsByProject[p.id] || scriptsByProject[p.id].length === 0) && <p className="text-xs text-gray-500 p-2">No scripts yet.</p>}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
            <div className="mt-auto pt-4 border-t border-zinc-700">
                <a href="#" className="flex items-center p-2 text-sm rounded-md text-gray-400 hover:bg-zinc-700 hover:text-white">
                    <Settings size={16} className="mr-3" />
                    <span>Settings</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;