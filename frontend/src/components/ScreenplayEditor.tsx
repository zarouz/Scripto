import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import {
    ElementType,
    getNextElementType,
    parseScreenplay,
    ELEMENT_STYLES,
    ScreenplayElement,
} from '../utils/screenplay';

interface ScreenplayEditorProps {
    content: string;
    onContentChange: (newContent: string) => void;
    isLoading: boolean;
    distractionFree?: boolean;
}

const ScreenplayEditor = ({
    content,
    onContentChange,
    isLoading,
    distractionFree = false,
}: ScreenplayEditorProps) => {
    const [elements, setElements] = useState<ScreenplayElement[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [forcedTypes, setForcedTypes] = useState<Map<number, ElementType>>(new Map());
    const editorRef = useRef<HTMLDivElement>(null);
    const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Parse screenplay on content change
    useEffect(() => {
        const parsed = parseScreenplay(content);
        setElements(parsed);
    }, [content]);

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();

            // Get current element type
            const currentElement = elements[currentLineIndex];
            if (!currentElement) return;

            const currentType = forcedTypes.get(currentLineIndex) || currentElement.type;
            const nextType = getNextElementType(currentType);

            // Update forced type
            const newForcedTypes = new Map(forcedTypes);
            newForcedTypes.set(currentLineIndex, nextType);
            setForcedTypes(newForcedTypes);

        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // Update current line on arrow key
            setTimeout(() => {
                updateCurrentLine();
            }, 0);
        }
    };

    // Update current line index
    const updateCurrentLine = () => {
        if (!hiddenTextareaRef.current) return;

        const textarea = hiddenTextareaRef.current;
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = content.substring(0, cursorPosition);
        const lineIndex = textBeforeCursor.split('\n').length - 1;

        setCurrentLineIndex(lineIndex);
    };

    // Handle content change
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onContentChange(e.target.value);
        updateCurrentLine();
    };

    // Get element type (forced or detected)
    const getElementType = (index: number): ElementType => {
        return forcedTypes.get(index) || elements[index]?.type || 'action';
    };

    // Get style class for element type
    const getElementClass = (type: ElementType, isActive: boolean): string => {
        const style = ELEMENT_STYLES[type];
        let classes = 'min-h-[2em] py-1 ';

        // Margins
        if (style.marginLeft > 0) classes += `pl-[${style.marginLeft}px] `;
        if (style.marginRight > 0) classes += `pr-[${style.marginRight}px] `;

        // Text transform
        if (style.textTransform === 'uppercase') classes += 'uppercase ';

        // Text align
        if (style.textAlign === 'center') classes += 'text-center ';
        if (style.textAlign === 'right') classes += 'text-right ';

        // Font weight
        if (style.fontWeight === 'bold') classes += 'font-bold ';

        // Active line highlight
        if (isActive) classes += 'bg-zinc-800/50 ';

        return classes;
    };

    const currentLineType = getElementType(currentLineIndex);

    if (isLoading) {
        return <div className="p-8 text-gray-400">Loading script...</div>;
    }

    return (
        <div className="flex-1 relative">
            {/* Type indicator */}
            {!distractionFree && (
                <div className="absolute top-4 right-4 z-10 bg-zinc-800 px-3 py-1 rounded-md text-xs text-gray-400 border border-zinc-700">
                    {currentLineType.replace('_', ' ').toUpperCase()}
                    <span className="ml-2 text-gray-500">(TAB to cycle)</span>
                </div>
            )}

            {/* Formatted overlay */}
            <div
                ref={editorRef}
                className="h-full overflow-auto bg-zinc-900"
                onClick={() => hiddenTextareaRef.current?.focus()}
            >
                <div className="max-w-[850px] mx-auto py-12 px-8">
                    {/* Hidden textarea for input */}
                    <textarea
                        ref={hiddenTextareaRef}
                        value={content}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onClick={updateCurrentLine}
                        onKeyUp={updateCurrentLine}
                        className="w-full min-h-screen bg-transparent text-transparent caret-white resize-none focus:outline-none font-mono text-[12pt] leading-[2] absolute inset-0 z-10"
                        placeholder="Start writing your screenplay here..."
                        spellCheck={false}
                        style={{ caretColor: 'white' }}
                    />

                    {/* Formatted text display */}
                    <div className="relative pointer-events-none font-mono text-[12pt] leading-[2] text-gray-200 whitespace-pre-wrap">
                        {elements.map((element, index) => {
                            const type = getElementType(index);
                            const isActive = index === currentLineIndex;

                            return (
                                <div
                                    key={index}
                                    className={getElementClass(type, isActive)}
                                >
                                    {element.text || '\n'}
                                </div>
                            );
                        })}
                        {content === '' && (
                            <div className="text-gray-600">
                                Start writing your screenplay here...
                                <br /><br />
                                Press TAB to cycle through element types:
                                <br />• Scene Heading
                                <br />• Action
                                <br />• Character
                                <br />• Dialogue
                                <br />• Parenthetical
                                <br />• Transition
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScreenplayEditor;
