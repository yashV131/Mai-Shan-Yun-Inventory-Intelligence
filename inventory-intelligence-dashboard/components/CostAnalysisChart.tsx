
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ingredients, inventoryLogs } from '../services/mockData';
import Card from './Card';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-white">{`${label}`}</p>
          <p className="intro text-indigo-400">{`Total Cost: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

const CostAnalysisChart: React.FC = () => {

  const data = useMemo(() => {
    const costByIngredient: { [key: string]: number } = {};
    
    inventoryLogs.forEach(log => {
      // Only consider purchases
      if (log.quantityChange > 0 && log.costPerUnit > 0) {
        if (!costByIngredient[log.ingredientId]) {
            costByIngredient[log.ingredientId] = 0;
        }
        const totalCost = log.quantityChange * log.costPerUnit;
        costByIngredient[log.ingredientId] += totalCost;
      }
    });

    return Object.entries(costByIngredient)
      .map(([id, totalCost]) => {
        const ingredient = ingredients.find(ing => ing.id === id);
        return {
          name: ingredient?.name || 'Unknown',
          cost: totalCost,
        };
      })
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10); // Top 10 cost drivers
  }, []);

  return (
    <Card title="Top 10 Cost-Driving Ingredients">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis type="number" stroke="#A0AEC0"/>
          <YAxis dataKey="name" type="category" width={120} stroke="#A0AEC0"/>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 90, 213, 0.1)' }}/>
          <Legend />
          <Bar dataKey="cost" name="Total Spending" fill="#818CF8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default CostAnalysisChart;
