
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
    isUploading: boolean;
}

const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
        // Reset file input to allow uploading the same file again
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".xlsx"
                disabled={isUploading}
            />
            <button
                onClick={handleClick}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                title="Upload monthly sales (.xlsx)"
            >
                {isUploading ? (
                    <>
                        <Spinner />
                        <span className="hidden sm:inline">Processing...</span>
                    </>
                ) : (
                    <>
                        <UploadIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Upload Sales</span>
                    </>
                )}
            </button>
        </>
    );
};