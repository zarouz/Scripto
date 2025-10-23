interface EditorProps {
    content: string;
    onContentChange: (newContent: string) => void;
    isLoading: boolean;
}

const Editor = ({ content, onContentChange, isLoading }: EditorProps) => {
    if (isLoading) {
        return <div className="p-8 text-gray-400">Loading script...</div>;
    }

    return (
        <div className="flex-1 p-2 bg-zinc-900">
            <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="w-full h-full bg-transparent text-gray-200 resize-none focus:outline-none p-6 font-mono leading-7"
                placeholder="Start writing your script here..."
            />
        </div>
    );
};

export default Editor;