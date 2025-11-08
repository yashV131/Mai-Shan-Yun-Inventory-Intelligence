
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { forecastIngredientDemand } from '../services/geminiService';
import { salesData, menuItems, ingredients } from '../services/mockData';
import type { ForecastData } from '../types';
import Card from './Card';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-white">{`${label}`}</p>
          <p className="intro text-indigo-400">{`Forecasted Demand: ${payload[0].value.toFixed(2)} ${payload[0].payload.unit}`}</p>
        </div>
      );
    }
    return null;
  };

const DemandForecastChart: React.FC = () => {
  const [forecastData, setForecastData] = useState<ForecastData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForecast = async () => {
    setIsLoading(true);
    setError(null);
    setForecastData(null);
    try {
      const data = await forecastIngredientDemand(salesData, menuItems);
      // Enrich with ingredient unit from original data if missing, for chart tooltip
      const enrichedData = data.map(d => {
        const ing = ingredients.find(i => i.name.toLowerCase() === d.ingredientName.toLowerCase());
        return {...d, unit: d.unit || ing?.unit || ''};
      });
      setForecastData(enrichedData);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if(!forecastData) return [];
    return forecastData.sort((a,b) => b.forecastedDemand - a.forecastedDemand);
  }, [forecastData]);

  return (
    <Card
      title="Next 30-Day Ingredient Demand Forecast"
      actions={
        <button
          onClick={handleForecast}
          disabled={isLoading}
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
             Forecasting...
            </>
          ) : 'Generate Forecast'}
        </button>
      }
    >
        {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
        
        {!forecastData && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
                <p className="text-lg mb-2">Ready to predict your future inventory needs?</p>
                <p>Click the "Generate Forecast" button to use Gemini to analyze historical sales data and predict demand for the next 30 days.</p>
            </div>
        )}
        
        {isLoading && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
                 <p className="text-lg mb-2">Gemini is analyzing your data...</p>
                 <p>This may take a moment. We're processing sales trends and recipes to create your forecast.</p>
            </div>
        )}

        {forecastData && (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis type="number" stroke="#A0AEC0" />
                <YAxis dataKey="ingredientName" type="category" width={120} stroke="#A0AEC0" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 90, 213, 0.1)' }}/>
                <Legend />
                <Bar dataKey="forecastedDemand" name="Forecasted Demand" fill="#818CF8" />
            </BarChart>
        </ResponsiveContainer>
        )}
    </Card>
  );
};

export default DemandForecastChart;
