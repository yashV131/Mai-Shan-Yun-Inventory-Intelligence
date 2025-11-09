
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Forecast } from '../types';
import { SparklesIcon } from './icons';

interface ForecastCardProps {
    forecast: Forecast | null;
    isForecasting: boolean;
    onGenerateForecast: () => void;
    selectedMonth: string;
}

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
);

const getNextMonthName = (currentMonthName: string): string => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentIndex = months.indexOf(currentMonthName);
    if (currentIndex === -1) return "Next Month";
    return months[(currentIndex + 1) % 12];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 border border-gray-600 rounded">
        <p className="font-bold">{label}</p>
        <p className="text-accent">{`Forecast: ${payload[0].value.toLocaleString()} g/pcs`}</p>
      </div>
    );
  }
  return null;
};

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, isForecasting, onGenerateForecast, selectedMonth }) => {
    
    const forecastData = forecast ? Object.entries(forecast).map(([name, value]) => ({ name, forecast: value })) : [];
    const nextMonthName = getNextMonthName(selectedMonth);

    return (
        <div className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center justify-center h-full">
            <SparklesIcon className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">AI Ingredient Forecast for {nextMonthName}</h3>
            
            {!isForecasting && !forecast && (
                <div className="text-center">
                    <p className="text-text-secondary mb-6">
                        Use Gemini to predict ingredient needs based on historical sales data.
                    </p>
                    <button
                        onClick={onGenerateForecast}
                        disabled={isForecasting}
                        className="bg-accent hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Generate Forecast
                    </button>
                </div>
            )}

            {isForecasting && (
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner />
                    <p className="text-text-secondary">Analyzing trends and forecasting...</p>
                </div>
            )}

            {!isForecasting && forecast && (
                <div className="w-full flex-grow flex flex-col">
                    <div className="flex-grow w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastData} margin={{ top: 5, right: 20, left: 20, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568"/>
                                <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" />
                                <YAxis stroke="#a0aec0" tick={{ fontSize: 14 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="forecast" fill="#4299e1" name="Forecast (g/pcs)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                     <button
                        onClick={onGenerateForecast}
                        className="w-full mt-6 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        Regenerate
                    </button>
                </div>
            )}
        </div>
    );
};