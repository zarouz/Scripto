// Screenplay Element Types
export type ElementType =
    | 'scene_heading'
    | 'action'
    | 'character'
    | 'dialogue'
    | 'parenthetical'
    | 'transition'
    | 'centered';

export interface ScreenplayElement {
    type: ElementType;
    text: string;
    lineNumber: number;
}

export interface FormattingStyle {
    marginLeft: number;
    marginRight: number;
    textTransform?: 'uppercase' | 'none';
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
}

// Industry-standard screenplay formatting (in characters, ~10px per character)
export const ELEMENT_STYLES: Record<ElementType, FormattingStyle> = {
    scene_heading: {
        marginLeft: 0,
        marginRight: 0,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    action: {
        marginLeft: 0,
        marginRight: 0,
    },
    character: {
        marginLeft: 220,
        marginRight: 0,
        textTransform: 'uppercase',
    },
    dialogue: {
        marginLeft: 100,
        marginRight: 150,
    },
    parenthetical: {
        marginLeft: 150,
        marginRight: 200,
    },
    transition: {
        marginLeft: 400,
        marginRight: 0,
        textTransform: 'uppercase',
        textAlign: 'right',
    },
    centered: {
        marginLeft: 0,
        marginRight: 0,
        textAlign: 'center',
    },
};

// Detect element type from content
export function detectElementType(text: string, previousType?: ElementType): ElementType {
    const trimmed = text.trim();

    if (!trimmed) return 'action';

    // Scene heading: starts with INT., EXT., INT./EXT., or I/E
    if (/^(INT\.?|EXT\.?|INT\.?\/EXT\.?|I\/E\.?)\s/i.test(trimmed)) {
        return 'scene_heading';
    }

    // Transition: all caps ending with TO:
    if (/^[A-Z\s]+TO:$/.test(trimmed)) {
        return 'transition';
    }

    // Centered: starts and ends with >
    if (/^>.*<$/.test(trimmed)) {
        return 'centered';
    }

    // Parenthetical: wrapped in parentheses
    if (/^\(.*\)$/.test(trimmed)) {
        return 'parenthetical';
    }

    // Character: all caps, possibly with extension
    // Must be preceded by action or scene heading (not dialogue)
    if (/^[A-Z\s\.']+(\s*\(.*\))?$/.test(trimmed) && trimmed.length < 40) {
        if (previousType === 'action' || previousType === 'scene_heading' || !previousType) {
            return 'character';
        }
    }

    // Dialogue: follows character or parenthetical
    if (previousType === 'character' || previousType === 'parenthetical' || previousType === 'dialogue') {
        if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
            return 'dialogue';
        }
    }

    // Default to action
    return 'action';
}

// Parse screenplay into structured elements
export function parseScreenplay(content: string): ScreenplayElement[] {
    const lines = content.split('\n');
    const elements: ScreenplayElement[] = [];
    let previousType: ElementType | undefined;

    lines.forEach((line, index) => {
        const type = detectElementType(line, previousType);
        elements.push({
            type,
            text: line,
            lineNumber: index,
        });

        // Update previous type for context
        if (line.trim()) {
            previousType = type;
        }
    });

    return elements;
}

// Format text according to element type
export function formatElement(text: string, type: ElementType): string {
    const style = ELEMENT_STYLES[type];

    let formatted = text.trim();

    // Apply text transformations
    if (style.textTransform === 'uppercase') {
        formatted = formatted.toUpperCase();
    }

    // Remove Fountain syntax for centered text
    if (type === 'centered') {
        formatted = formatted.replace(/^>|<$/g, '').trim();
    }

    return formatted;
}

// Get next element type in cycle (for TAB key)
export function getNextElementType(currentType: ElementType): ElementType {
    const cycle: ElementType[] = [
        'scene_heading',
        'action',
        'character',
        'dialogue',
        'parenthetical',
        'transition',
    ];

    const currentIndex = cycle.indexOf(currentType);
    const nextIndex = (currentIndex + 1) % cycle.length;
    return cycle[nextIndex];
}

// Extract scenes from screenplay
export interface Scene {
    heading: string;
    lineNumber: number;
    content: string[];
}

export function extractScenes(elements: ScreenplayElement[]): Scene[] {
    const scenes: Scene[] = [];
    let currentScene: Scene | null = null;

    elements.forEach((element) => {
        if (element.type === 'scene_heading') {
            if (currentScene) {
                scenes.push(currentScene);
            }
            currentScene = {
                heading: element.text.trim(),
                lineNumber: element.lineNumber,
                content: [],
            };
        } else if (currentScene && element.text.trim()) {
            currentScene.content.push(element.text);
        }
    });

    if (currentScene) {
        scenes.push(currentScene);
    }

    return scenes;
}

// Extract characters from screenplay
export function extractCharacters(elements: ScreenplayElement[]): Set<string> {
    const characters = new Set<string>();

    elements.forEach((element) => {
        if (element.type === 'character') {
            // Remove extensions like (V.O.) or (CONT'D)
            const name = element.text.trim().replace(/\s*\(.*\)$/, '');
            if (name) {
                characters.add(name);
            }
        }
    });

    return characters;
}

// Extract locations from scene headings
export function extractLocations(elements: ScreenplayElement[]): Set<string> {
    const locations = new Set<string>();

    elements.forEach((element) => {
        if (element.type === 'scene_heading') {
            // Extract location from scene heading
            // Format: INT./EXT. LOCATION - TIME
            const match = element.text.match(/^(?:INT\.?|EXT\.?|INT\.?\/EXT\.?|I\/E\.?)\s+(.+?)(?:\s+-\s+|\s*$)/i);
            if (match && match[1]) {
                locations.add(match[1].trim());
            }
        }
    });

    return locations;
}
