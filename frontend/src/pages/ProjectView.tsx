import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScriptsForProject } from '@/api';

/**
 * A component that acts as a landing page for a project.
 * It finds the first script in the project and redirects to its editor.
 * If no scripts exist, it will show a message (future improvement: prompt to create one).
 */
const ProjectView = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!projectId) return;

        getScriptsForProject(projectId)
            .then(scripts => {
                if (scripts && scripts.length > 0) {
                    // If scripts exist, navigate to the first one.
                    // `replace: true` prevents the user from clicking "back" to this loading page.
                    navigate(`/scripts/${scripts[0].id}`, { replace: true });
                } else {
                    // If no scripts, maybe navigate to a "Create new script" page
                    // or show a message. For now, we'll log it and stay here.
                    console.log("This project has no scripts yet.");
                    // In a real app, you might navigate to a dedicated page:
                    // navigate(`/projects/${projectId}/new-script`, { replace: true }); 
                }
            })
            .catch(error => {
                console.error("Failed to fetch scripts for project:", error);
                // You could redirect to an error page or show an error message here
            });
    }, [projectId, navigate]);

    // This component will show a loading state while it determines where to go.
    // We can add a more informative message if no scripts are found.
    if (!projectId) return <div className="p-8">Invalid project ID.</div>;

    // The user will see this briefly while scripts are being fetched.
    return <div className="p-8 text-gray-400">Loading project scripts...</div>;
};

export default ProjectView;