import { useEffect, useState } from 'react';
import { parseFountain } from '../api';
import { parseScreenplay, ELEMENT_STYLES, ScreenplayElement } from '../utils/screenplay';

interface ScreenplayPreviewProps {
    content: string;
    useFountainParser?: boolean;
}

const ScreenplayPreview = ({ content, useFountainParser = false }: ScreenplayPreviewProps) => {
    const [formattedHtml, setFormattedHtml] = useState<string>('');
    const [elements, setElements] = useState<ScreenplayElement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (useFountainParser) {
            // Use external Fountain parser
            const parseContent = async () => {
                if (!content.trim()) {
                    setFormattedHtml('');
                    return;
                }

                setIsLoading(true);
                setError(null);

                try {
                    const result = await parseFountain(content);
                    setFormattedHtml(result.html);
                } catch (err) {
                    console.error('Failed to parse Fountain:', err);
                    setError('Failed to parse screenplay. Using basic preview.');
                    // Fallback to basic preview
                    setElements(parseScreenplay(content));
                } finally {
                    setIsLoading(false);
                }
            };

            // Debounce parsing
            const timeoutId = setTimeout(parseContent, 500);
            return () => clearTimeout(timeoutId);
        } else {
            // Use built-in parser
            setElements(parseScreenplay(content));
        }
    }, [content, useFountainParser]);

    // Render element with proper styling
    const renderElement = (element: ScreenplayElement) => {
        const style = ELEMENT_STYLES[element.type];

        return (
            <div
                key={element.lineNumber}
                className="min-h-[1.5em]"
                style={{
                    paddingLeft: `${style.marginLeft}px`,
                    paddingRight: `${style.marginRight}px`,
                    textTransform: style.textTransform || 'none',
                    textAlign: style.textAlign || 'left',
                    fontWeight: style.fontWeight || 'normal',
                }}
            >
                {element.text || '\u00A0'}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Parsing screenplay...</div>
            </div>
        );
    }

    if (!content.trim()) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-600 text-center">
                    <p className="text-lg mb-2">Preview</p>
                    <p className="text-sm">Start writing to see formatted preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto bg-white">
            <div className="max-w-[850px] mx-auto py-12 px-8">
                {error && (
                    <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {useFountainParser && formattedHtml ? (
                    // Render Fountain-parsed HTML
                    <div
                        className="screenplay-content font-mono text-[12pt] leading-[2] text-black"
                        dangerouslySetInnerHTML={{ __html: formattedHtml }}
                    />
                ) : (
                    // Render with built-in parser
                    <div className="screenplay-content font-mono text-[12pt] leading-[2] text-black">
                        {elements.map(renderElement)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScreenplayPreview;
