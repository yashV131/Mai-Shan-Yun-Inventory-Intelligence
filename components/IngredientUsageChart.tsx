
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { IngredientUsage } from '../types';

interface IngredientUsageChartProps {
    data: IngredientUsage[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 border border-gray-600 rounded">
        <p className="label">{`${label}`}</p>
        <p className="intro">{`Usage: ${payload[0].value.toLocaleString()} g`}</p>
      </div>
    );
  }
  return null;
};

export const IngredientUsageChart: React.FC<IngredientUsageChartProps> = ({ data }) => {
    const sortedData = [...data].sort((a, b) => b.usage - a.usage);
    const chartHeight = Math.max(300, sortedData.length * 35); // Ensure a minimum height

    return (
        <div className="h-full w-full overflow-y-auto pr-4">
            {sortedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={chartHeight}>
                     <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                        <XAxis type="number" stroke="#a0aec0" tick={{ fontSize: 14 }} />
                        <YAxis dataKey="name" type="category" stroke="#a0aec0" width={100} tick={{ fontSize: 14 }} interval={0} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="usage" fill="#4299e1" name="Usage (g)" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">No usage data for this month.</div>
            )}
        </div>
    );
};