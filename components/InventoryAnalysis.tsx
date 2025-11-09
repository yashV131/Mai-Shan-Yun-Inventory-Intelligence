
import React from 'react';
import { SparklesIcon } from './icons';

interface InventoryAnalysisProps {
    analysis: string | null;
    isAnalyzing: boolean;
    onGenerate: () => void;
}

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
);

// Simple markdown-to-HTML parser for bold text and lists
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n').map((line, index) => {
        // Replace **bold** with <strong>
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Check for unordered list items (* or -)
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            return <li key={index} dangerouslySetInnerHTML={{ __html: line.trim().substring(2) }} />;
        }
        return <p key={index} dangerouslySetInnerHTML={{ __html: line }} />;
    });

    // Group list items
    const groupedLines: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    lines.forEach((line, index) => {
        if (React.isValidElement(line) && line.type === 'li') {
            currentList.push(line);
        } else {
            if (currentList.length > 0) {
                groupedLines.push(<ul key={`ul-${index}`} className="list-disc list-inside space-y-1 my-2">{currentList}</ul>);
                currentList = [];
            }
            groupedLines.push(line);
        }
    });

    if (currentList.length > 0) {
        groupedLines.push(<ul key="ul-end" className="list-disc list-inside space-y-1 my-2">{currentList}</ul>);
    }

    return <>{groupedLines}</>;
};


export const InventoryAnalysis: React.FC<InventoryAnalysisProps> = ({ analysis, isAnalyzing, onGenerate }) => {
    return (
        <div className="p-4 flex flex-col h-full text-sm">
            <h4 className="font-semibold text-text-primary mb-3 text-base flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-accent" />
                AI Inventory Analysis
            </h4>

            {isAnalyzing && (
                 <div className="flex-grow flex flex-col items-center justify-center text-center text-text-secondary">
                    <LoadingSpinner />
                    <p className="mt-3">Analyzing inventory levels...</p>
                </div>
            )}

            {!isAnalyzing && !analysis && (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <p className="text-text-secondary mb-4">
                        Get suggestions on how to adjust shipments based on current stock levels.
                    </p>
                    <button
                        onClick={onGenerate}
                        className="w-full bg-primary hover:bg-gray-600 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                         <SparklesIcon className="w-4 h-4" />
                        Get Analysis
                    </button>
                </div>
            )}

            {!isAnalyzing && analysis && (
                 <div className="flex-grow flex flex-col min-h-0">
                    <div className="prose prose-sm prose-invert text-text-secondary space-y-2 overflow-y-auto flex-grow pr-2">
                       <SimpleMarkdown text={analysis} />
                    </div>
                     <button
                        onClick={onGenerate}
                        className="w-full mt-4 bg-primary hover:bg-gray-600 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Regenerate
                    </button>
                </div>
            )}
        </div>
    );
};