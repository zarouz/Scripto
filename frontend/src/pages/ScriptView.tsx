import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import Editor from '../components/Editor';
import { getScriptContent, updateScriptContent } from '@/api';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const ScriptView = () => {
    const { scriptId } = useParams<{ scriptId: string }>();
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    useEffect(() => {
        // This effect runs whenever the user navigates to a new script
        if (!scriptId) {
            setIsLoading(false);
            setContent('');
            setTitle('');
            return;
        };

        setIsLoading(true);
        setSaveStatus('idle'); // Reset save status on new script
        getScriptContent(scriptId)
            .then(data => {
                setContent(data.content);
                setTitle(data.title);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [scriptId]);

    const handleSave = async () => {
        if (!scriptId || saveStatus === 'saving') return;

        setSaveStatus('saving');
        try {
            await updateScriptContent(scriptId, content);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error("Failed to save script:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const getSaveButtonText = () => {
        switch (saveStatus) {
            case 'saving': return 'Saving...';
            case 'saved': return 'Saved!';
            case 'error': return 'Error!';
            default: return 'Save';
        }
    };

    if (!scriptId) {
        return null; // Or a placeholder message
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center sticky top-0 bg-zinc-900 z-10">
                <h2 className="text-xl font-semibold text-white">
                    {isLoading ? 'Loading...' : title}
                </h2>
                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving' || isLoading}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    <Save size={16} className="mr-2" />
                    {getSaveButtonText()}
                </button>
            </div>
            <Editor
                content={content}
                onContentChange={setContent}
                isLoading={isLoading}
            />
        </div>
    );
};

export default ScriptView;