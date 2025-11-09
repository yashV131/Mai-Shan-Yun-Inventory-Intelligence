
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from 'recharts';
import { InventoryLevel } from '../types';

interface InventoryLevelsChartProps {
    data: InventoryLevel[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 border border-gray-600 rounded">
        <p className="font-bold">{label}</p>
        <p className="text-green-400">{`Purchased: ${payload[0].value.toLocaleString()} g`}</p>
        <p className="text-yellow-400">{`Used: ${payload[1].value.toLocaleString()} g`}</p>
        <p className="text-blue-400">{`Net: ${ (payload[0].value - payload[1].value).toLocaleString()} g`}</p>
      </div>
    );
  }
  return null;
};

export const InventoryLevelsChart: React.FC<InventoryLevelsChartProps> = ({ data }) => {
    
    const top10Data = [...data]
        .sort((a,b) => Math.abs(b.net) - Math.abs(a.net))
        .slice(0, 10);

    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
               {top10Data.length > 0 ? (
                 <BarChart data={top10Data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568"/>
                    <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={50} />
                    <YAxis stroke="#a0aec0" tick={{ fontSize: 14 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} wrapperStyle={{ fontSize: '14px' }} />
                    <Legend />
                    <Bar dataKey="purchased" stackId="a" fill="#38a169" name="Purchased"/>
                    <Bar dataKey="used" stackId="b" fill="#d69e2e" name="Used"/>
                 </BarChart>
               ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary">No inventory data to display.</div>
               )}
            </ResponsiveContainer>
             <p className="text-xs text-text-secondary italic text-center mt-2 px-4">
                *'Purchased' amount reflects total expected shipments for the month.
            </p>
        </div>
    );
};