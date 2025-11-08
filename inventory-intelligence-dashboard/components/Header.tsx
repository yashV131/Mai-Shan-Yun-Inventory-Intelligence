
import React from 'react';
import type { ViewType } from '../types';

interface HeaderProps {
  activeView: ViewType;
}

const viewTitles: Record<ViewType, string> = {
  insights: 'Ingredient Insights',
  forecasting: 'Demand Forecasting',
  shipments: 'Shipment Tracking',
  costs: 'Cost Optimization'
};

const Header: React.FC<HeaderProps> = ({ activeView }) => {
  return (
    <header className="h-20 flex items-center px-4 md:px-8 border-b border-gray-700 bg-gray-900 z-10">
      <h1 className="text-2xl font-semibold text-white">{viewTitles[activeView]}</h1>
    </header>
  );
};

export default Header;
