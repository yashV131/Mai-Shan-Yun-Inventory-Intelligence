import React from 'react';
import { MonthSelector } from './MonthSelector';
import { FileUpload } from './FileUpload';
// import { Logo } from './Logo';

interface HeaderProps {
    selectedMonth: string;
    availableMonths: string[];
    onMonthChange: (month: string) => void;
    onFileUpload: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedMonth, availableMonths, onMonthChange, onFileUpload }) => {
    return (
        <header className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  
                    <h1 className="text-3xl md:text-4xl font-bold text-white whitespace-nowrap">
                        Inventory Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <MonthSelector
                        selectedMonth={selectedMonth}
                        availableMonths={availableMonths}
                        onMonthChange={onMonthChange}
                    />
                    <FileUpload onFileUpload={onFileUpload} />
                </div>
            </div>
             <hr className="mt-6 border-gray-700" />
        </header>
    );
};