
import React from 'react';
import { RestockDetail } from '../types';

interface ReorderForecastProps {
    data: RestockDetail[];
}

export const ReorderForecast: React.FC<ReorderForecastProps> = ({ data }) => {
    const getStatusClass = (status: RestockDetail['status']) => {
        switch (status) {
            case 'Understocked':
            case 'Risk of Understock':
                return 'bg-red-500 text-white';
            case 'Overstocked':
                return 'bg-orange-500 text-white';
            case 'Perfectly Stocked':
            case 'Stocked':
                return 'bg-green-500 text-white';
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
                            <th scope="col" className="px-4 py-2 text-right">Purchased</th>
                            <th scope="col" className="px-4 py-2 text-right">Consumption</th>
                            <th scope="col" className="px-4 py-2 text-right">Stock Left</th>
                            <th scope="col" className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.name} className="border-b border-primary hover:bg-primary">
                                <th scope="row" className="px-4 py-2 font-medium text-text-primary whitespace-nowrap">
                                    {item.name}
                                </th>
                                <td className="px-4 py-2 text-right">{item.purchased ? item.purchased.toLocaleString() : '-'} g</td>
                                <td className="px-4 py-2 text-right">{item.consumption ? item.consumption.toLocaleString() : '-'} g</td>
                                <td className="px-4 py-2 text-right">{item.stockLeft.toLocaleString()} g</td>
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