
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from 'recharts';
import { InventoryLevel } from '../types';

interface InventoryLevelsChartProps {
  data: InventoryLevel[];
  // Optional map of item name -> predicted sales count for the selected month
  salesPrediction?: Record<string, number>;
}

const CustomTooltip = ({ active, payload, label, mode }: any) => {
  if (active && payload && payload.length) {
    if (mode === 'sales') {
      const data = payload[0].payload as any;
      return (
        <div className="bg-gray-800 text-white p-2 border border-gray-600 rounded">
          <p className="font-bold">{label}</p>
          <p className="text-accent">{`Predicted Count: ${data.predicted.toLocaleString()}`}</p>
        </div>
      );
    }

    // Find purchased/used entries by dataKey (robust to ordering)
    const purchasedEntry = payload.find((p: any) => p.dataKey === 'purchased' || p.name === 'Purchased');
    const usedEntry = payload.find((p: any) => p.dataKey === 'used' || p.name === 'Used');
    // fallback: try to read from payload[0].payload if data keys are nested
    const fallback = payload[0]?.payload || {};
    const purchasedVal = purchasedEntry ? purchasedEntry.value : (fallback.purchased ?? 0);
    const usedVal = usedEntry ? usedEntry.value : (fallback.used ?? 0);
    const netVal = (typeof purchasedVal === 'number' && typeof usedVal === 'number') ? (purchasedVal - usedVal) : (fallback.net ?? (purchasedVal - usedVal));

    return (
      <div className="bg-gray-800 text-white p-2 border border-gray-600 rounded">
        <p className="font-bold">{label}</p>
        <p className="text-green-400">{`Purchased: ${Number(purchasedVal).toLocaleString()} g`}</p>
        <p className="text-yellow-400">{`Used: ${Number(usedVal).toLocaleString()} g`}</p>
        <p className="text-blue-400">{`Net: ${Number(netVal).toLocaleString()} g`}</p>
      </div>
    );
  }
  return null;
};

export const InventoryLevelsChart: React.FC<InventoryLevelsChartProps> = ({ data, salesPrediction }) => {
  // Inventory sorted by absolute net change (show all items)
  const inventorySorted = [...data]
    .sort((a,b) => Math.abs(b.net) - Math.abs(a.net));

  // If salesPrediction provided, build a top-10 sales array to show predicted counts
  const salesTop10 = salesPrediction && Object.keys(salesPrediction).length > 0
    ? Object.entries(salesPrediction)
      .map(([name, count]) => ({ name, predicted: count }))
      .sort((a,b) => (b.predicted as number) - (a.predicted as number))
      .slice(0, 10)
    : [];

  const showSales = salesTop10.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
         {showSales ? (
         <BarChart data={salesTop10} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568"/>
          <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={50} />
          <YAxis stroke="#a0aec0" tick={{ fontSize: 14 }} />
          <Tooltip content={<CustomTooltip mode="sales" />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} wrapperStyle={{ fontSize: '14px' }} />
          <Legend />
          <Bar dataKey="predicted" fill="#4299e1" name="Predicted Count" />
         </BarChart>
               ) : (
                 inventorySorted.length > 0 ? (
                   <BarChart data={inventorySorted} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                 )
               )}
      </ResponsiveContainer>
       <p className="text-xs text-text-secondary italic text-center mt-2 px-4">
        {showSales ? "*Showing top predicted sales for the selected month." : "*'Purchased' amount reflects total expected shipments for the month."}
      </p>
    </div>
  );
};