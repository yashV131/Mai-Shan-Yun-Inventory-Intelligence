
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ingredients, inventoryLogs } from '../services/mockData';
import Card from './Card';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-white">{`${label}`}</p>
        <p className="intro text-indigo-400">{`Usage: ${Math.abs(payload[0].value).toFixed(2)} ${payload[0].payload.unit}`}</p>
      </div>
    );
  }
  return null;
};

const IngredientUsageChart: React.FC = () => {
  const [view, setView] = useState<'top' | 'least'>('top');
  const [month, setMonth] = useState<number>(new Date().getMonth());

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString('default', { month: 'long' })
    }));
  }, []);

  const data = useMemo(() => {
    const usageByIngredient: { [key: string]: number } = {};
    
    inventoryLogs.forEach(log => {
      const logDate = new Date(log.date);
      if (log.quantityChange < 0 && logDate.getMonth() === month) {
        if (!usageByIngredient[log.ingredientId]) {
          usageByIngredient[log.ingredientId] = 0;
        }
        usageByIngredient[log.ingredientId] += Math.abs(log.quantityChange);
      }
    });

    const sortedIngredients = Object.entries(usageByIngredient)
      .map(([id, totalUsage]) => {
        const ingredient = ingredients.find(ing => ing.id === id);
        return {
          name: ingredient?.name || 'Unknown',
          usage: totalUsage,
          unit: ingredient?.unit,
        };
      })
      .sort((a, b) => b.usage - a.usage);

    return view === 'top' ? sortedIngredients.slice(0, 7) : sortedIngredients.slice(-7).reverse();
  }, [month, view]);

  return (
    <Card 
      title={`Ingredient Usage for ${monthOptions.find(m => m.value === month)?.label}`}
      actions={
        <>
            <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            >
                {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="flex bg-gray-700 rounded-lg p-1">
                <button onClick={() => setView('top')} className={`px-3 py-1 text-sm rounded-md ${view === 'top' ? 'bg-indigo-600' : ''}`}>Top</button>
                <button onClick={() => setView('least')} className={`px-3 py-1 text-sm rounded-md ${view === 'least' ? 'bg-indigo-600' : ''}`}>Least</button>
            </div>
        </>
      }
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="name" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 90, 213, 0.1)' }}/>
          <Legend />
          <Bar dataKey="usage" name={view === 'top' ? "Top 7 Most Used" : "Top 7 Least Used"} fill="#818CF8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default IngredientUsageChart;
