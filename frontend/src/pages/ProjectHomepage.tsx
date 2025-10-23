import { FolderKanban } from "lucide-react";

const ProjectHomepage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <FolderKanban size={48} className="mb-4" />
            <h2 className="text-xl font-semibold text-gray-400">Project View</h2>
            <p>Select a script from the explorer to begin editing, or create a new one.</p>
        </div>
    );
};

export default ProjectHomepage;