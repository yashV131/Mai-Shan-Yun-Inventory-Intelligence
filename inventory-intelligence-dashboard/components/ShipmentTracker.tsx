
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { shipments } from '../services/mockData';
import Card from './Card';

interface MonthlyShipmentData {
  month: string;
  'On Time': number;
  'Delayed': number;
  'In Transit': number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-white font-bold">{label}</p>
          {payload.map((pld: any) => (
             <p key={pld.dataKey} style={{color: pld.fill}}>{`${pld.dataKey}: ${pld.value}`}</p>
          ))}
        </div>
      );
    }
    return null;
  };

const ShipmentTracker: React.FC = () => {

  const data = useMemo(() => {
    const monthlyData: { [key: string]: Omit<MonthlyShipmentData, 'month'> } = {};

    shipments.forEach(shipment => {
      const month = new Date(shipment.orderDate).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyData[month]) {
        monthlyData[month] = { 'On Time': 0, 'Delayed': 0, 'In Transit': 0 };
      }
      monthlyData[month][shipment.status]++;
    });

    return Object.entries(monthlyData)
      .map(([month, counts]) => ({ month, ...counts }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  }, []);

  return (
    <Card title="Monthly Shipment Status">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="month" stroke="#A0AEC0"/>
          <YAxis stroke="#A0AEC0"/>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 90, 213, 0.1)' }} />
          <Legend />
          <Bar dataKey="On Time" stackId="a" fill="#4ADE80" />
          <Bar dataKey="Delayed" stackId="a" fill="#F87171" />
          <Bar dataKey="In Transit" stackId="a" fill="#60A5FA" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ShipmentTracker;
