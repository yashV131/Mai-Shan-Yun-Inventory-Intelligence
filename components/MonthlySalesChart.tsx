import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MonthlySalesDetails, SalesDetail } from '../types';
import { ToggleGroup } from './ToggleGroup';

interface MonthlySalesChartProps {
    data: MonthlySalesDetails;
}

type ViewType = 'Group' | 'Category' | 'Item';
const VIEWS: ViewType[] = ['Group', 'Category', 'Item'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SalesDetail;
    return (
      <div className="bg-gray-800 text-white p-2 border border-gray-600 rounded">
        <p className="label font-bold">{`${label}`}</p>
        <p className="text-accent">{`Amount: $${data.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
        <p className="text-text-secondary">{`Count: ${data.count.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data }) => {
    const [view, setView] = useState<ViewType>('Group');

    const chartData = useMemo(() => {
        let sourceData: SalesDetail[];
        switch(view) {
            case 'Group':
                sourceData = data.byGroup;
                break;
            case 'Category':
                sourceData = data.byCategory;
                break;
            case 'Item':
                sourceData = data.byItem;
                break;
            default:
                sourceData = [];
        }
        return [...sourceData].sort((a, b) => b.amount - a.amount);
    }, [view, data]);

    const chartHeight = Math.max(300, chartData.length * 35);

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <ToggleGroup options={VIEWS} selected={view} onChange={(value) => setView(value)} />
            </div>
            <div className="flex-grow overflow-y-auto pr-4 min-h-0">
                <ResponsiveContainer width="100%" height={chartHeight}>
                    {chartData.length > 0 ? (
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis type="number" stroke="#a0aec0" tickFormatter={(tick) => `$${(tick/1000).toFixed(0)}k`} tick={{ fontSize: 14 }} />
                            <YAxis dataKey="name" type="category" stroke="#a0aec0" width={120} tick={{ fontSize: 14 }} interval={0} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} wrapperStyle={{ fontSize: '14px' }} />
                            <Bar dataKey="amount" fill="#4299e1" name="Amount" />
                        </BarChart>
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary">No sales data available for this view.</div>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};