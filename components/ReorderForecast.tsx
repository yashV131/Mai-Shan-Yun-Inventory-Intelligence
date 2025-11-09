
import React from 'react';
import { ReorderPrediction } from '../types';

interface ReorderForecastProps {
    data: ReorderPrediction[];
}

export const ReorderForecast: React.FC<ReorderForecastProps> = ({ data }) => {
    const getStatusClass = (status: ReorderPrediction['status']) => {
        switch (status) {
            case 'Re-order Now':
                return 'bg-yellow-500 text-yellow-900';
            case 'Sufficient Stock':
                return 'bg-green-500 text-green-900';
            default:
                return 'bg-gray-500 text-gray-100';
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto">
            {data.length > 0 ? (
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-text-secondary uppercase sticky top-0 bg-card">
                        <tr>
                            <th scope="col" className="px-4 py-2">Ingredient</th>
                            <th scope="col" className="px-4 py-2 text-right">Stock Left</th>
                            <th scope="col" className="px-4 py-2 text-right">Days Left</th>
                            <th scope="col" className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.name} className="border-b border-primary hover:bg-primary">
                                <th scope="row" className="px-4 py-2 font-medium text-text-primary whitespace-nowrap">
                                    {item.name}
                                </th>
                                <td className="px-4 py-2 text-right">
                                    {item.endOfMonthStock.toLocaleString()} g
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {isFinite(item.daysLeft) ? item.daysLeft : 'N/A'}
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                    No re-order predictions available.
                </div>
            )}
        </div>
    );
};