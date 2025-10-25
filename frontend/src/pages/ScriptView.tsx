import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Moon, Sun, Eye, EyeOff, PanelRightOpen, PanelRightClose, Maximize2, Minimize2 } from 'lucide-react';
import ScreenplayEditor from '../components/ScreenplayEditor';
import ScreenplayPreview from '../components/ScreenplayPreview';
import SceneNavigationSidebar from '../components/SceneNavigationSidebar';
import { getScriptContent, updateScriptContent } from '@/api';
import { useTheme } from '../contexts/ThemeContext';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const ScriptView = () => {
    const { scriptId } = useParams<{ scriptId: string }>();
    const { theme, toggleTheme } = useTheme();
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    // UI state
    const [showPreview, setShowPreview] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [distractionFree, setDistractionFree] = useState(false);

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

    // Auto-save functionality
    useEffect(() => {
        if (!scriptId || !content || isLoading) return;

        const timeoutId = setTimeout(async () => {
            try {
                await updateScriptContent(scriptId, content);
                // Optionally show a subtle save indicator
            } catch (error) {
                console.error("Auto-save failed:", error);
            }
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(timeoutId);
    }, [content, scriptId, isLoading]);

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

    const handleSceneClick = (lineNumber: number) => {
        // TODO: Implement scroll to line functionality
        console.log('Navigate to line:', lineNumber);
    };

    if (!scriptId) {
        return null; // Or a placeholder message
    }

    return (
        <div className="flex flex-col h-full bg-zinc-900">
            {/* Toolbar */}
            {!distractionFree && (
                <div className="p-4 border-b border-zinc-700 flex justify-between items-center sticky top-0 bg-zinc-900 z-20">
                    <h2 className="text-xl font-semibold text-white">
                        {isLoading ? 'Loading...' : title}
                    </h2>

                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Preview toggle */}
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                            title={showPreview ? 'Hide preview' : 'Show preview'}
                        >
                            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        {/* Sidebar toggle */}
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                            title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
                        >
                            {showSidebar ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                        </button>

                        {/* Distraction-free toggle */}
                        <button
                            onClick={() => setDistractionFree(!distractionFree)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                            title={distractionFree ? 'Exit distraction-free mode' : 'Enter distraction-free mode'}
                        >
                            {distractionFree ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={saveStatus === 'saving' || isLoading}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors ml-2"
                        >
                            <Save size={16} className="mr-2" />
                            {getSaveButtonText()}
                        </button>
                    </div>
                </div>
            )}

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {showSidebar && !distractionFree && (
                    <SceneNavigationSidebar
                        content={content}
                        isOpen={showSidebar}
                        onClose={() => setShowSidebar(false)}
                        onSceneClick={handleSceneClick}
                    />
                )}

                {/* Editor */}
                <div className={`flex-1 ${showPreview ? 'flex' : ''}`}>
                    <div className={showPreview ? 'w-1/2 border-r border-zinc-700' : 'w-full'}>
                        <ScreenplayEditor
                            content={content}
                            onContentChange={setContent}
                            isLoading={isLoading}
                            distractionFree={distractionFree}
                        />
                    </div>

                    {/* Preview */}
                    {showPreview && (
                        <div className="w-1/2">
                            <ScreenplayPreview
                                content={content}
                                useFountainParser={false}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Distraction-free mode exit hint */}
            {distractionFree && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setDistractionFree(false)}
                        className="px-3 py-1 text-xs text-gray-400 hover:text-white bg-zinc-800/90 rounded-md border border-zinc-700"
                    >
                        Press ESC or click to exit distraction-free mode
                    </button>
                </div>
            )}
        </div>
    );
};

export default ScriptView;