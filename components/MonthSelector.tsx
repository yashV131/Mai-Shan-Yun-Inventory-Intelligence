
import React from 'react';

interface MonthSelectorProps {
    selectedMonth: string;
    availableMonths: string[];
    onMonthChange: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, availableMonths, onMonthChange }) => {
    return (
        <div className="relative">
            <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="appearance-none w-full bg-primary text-text-primary py-2 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
                {availableMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
            </div>
        </div>
    );
};