import { useEffect, useState } from 'react';
import { MapPin, User, Film, ChevronRight, X } from 'lucide-react';
import {
    parseScreenplay,
    extractScenes,
    extractCharacters,
    extractLocations,
    Scene,
} from '../utils/screenplay';

interface SceneNavigationSidebarProps {
    content: string;
    isOpen: boolean;
    onClose: () => void;
    onSceneClick?: (lineNumber: number) => void;
}

type TabType = 'scenes' | 'characters' | 'locations';

const SceneNavigationSidebar = ({
    content,
    isOpen,
    onClose,
    onSceneClick,
}: SceneNavigationSidebarProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('scenes');
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [characters, setCharacters] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);

    useEffect(() => {
        if (!content) {
            setScenes([]);
            setCharacters([]);
            setLocations([]);
            return;
        }

        const elements = parseScreenplay(content);
        const parsedScenes = extractScenes(elements);
        const parsedCharacters = Array.from(extractCharacters(elements)).sort();
        const parsedLocations = Array.from(extractLocations(elements)).sort();

        setScenes(parsedScenes);
        setCharacters(parsedCharacters);
        setLocations(parsedLocations);
    }, [content]);

    const handleSceneClick = (lineNumber: number) => {
        if (onSceneClick) {
            onSceneClick(lineNumber);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 bg-zinc-800 border-r border-zinc-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Screenplay Info</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close sidebar"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-700">
                <button
                    onClick={() => setActiveTab('scenes')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'scenes'
                            ? 'text-white bg-zinc-900 border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                >
                    <Film size={16} className="inline mr-2" />
                    Scenes ({scenes.length})
                </button>
                <button
                    onClick={() => setActiveTab('characters')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'characters'
                            ? 'text-white bg-zinc-900 border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                >
                    <User size={16} className="inline mr-2" />
                    Characters ({characters.length})
                </button>
                <button
                    onClick={() => setActiveTab('locations')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'locations'
                            ? 'text-white bg-zinc-900 border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                >
                    <MapPin size={16} className="inline mr-2" />
                    Locations ({locations.length})
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'scenes' && (
                    <div className="p-2">
                        {scenes.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <Film size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No scenes yet</p>
                                <p className="text-xs mt-1">Start with INT. or EXT.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {scenes.map((scene, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSceneClick(scene.lineNumber)}
                                        className="w-full text-left p-3 rounded-md hover:bg-zinc-700 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    Scene {index + 1}
                                                </div>
                                                <div className="text-sm text-white font-medium truncate">
                                                    {scene.heading}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {scene.content.length} lines
                                                </div>
                                            </div>
                                            <ChevronRight
                                                size={16}
                                                className="text-gray-500 group-hover:text-white transition-colors flex-shrink-0 ml-2"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'characters' && (
                    <div className="p-2">
                        {characters.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <User size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No characters yet</p>
                                <p className="text-xs mt-1">Write character names in ALL CAPS</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {characters.map((character, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-md bg-zinc-700/50"
                                    >
                                        <div className="flex items-center">
                                            <User size={16} className="text-blue-400 mr-2 flex-shrink-0" />
                                            <div className="text-sm text-white font-medium">
                                                {character}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'locations' && (
                    <div className="p-2">
                        {locations.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No locations yet</p>
                                <p className="text-xs mt-1">Add scene headings to track locations</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {locations.map((location, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-md bg-zinc-700/50"
                                    >
                                        <div className="flex items-center">
                                            <MapPin size={16} className="text-green-400 mr-2 flex-shrink-0" />
                                            <div className="text-sm text-white font-medium">
                                                {location}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            <div className="p-4 border-t border-zinc-700 bg-zinc-900">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">{scenes.length}</div>
                        <div className="text-xs text-gray-500">Scenes</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{characters.length}</div>
                        <div className="text-xs text-gray-500">Characters</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{locations.length}</div>
                        <div className="text-xs text-gray-500">Locations</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SceneNavigationSidebar;
