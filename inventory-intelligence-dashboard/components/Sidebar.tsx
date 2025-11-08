
import React from 'react';
import type { ViewType } from '../types';
import BarChartIcon from './icons/BarChartIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import TruckIcon from './icons/TruckIcon';
import CashIcon from './icons/CashIcon';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const navItems = [
  { id: 'insights', label: 'Ingredient Insights', icon: BarChartIcon },
  { id: 'forecasting', label: 'Demand Forecasting', icon: TrendingUpIcon },
  { id: 'shipments', label: 'Shipment Tracking', icon: TruckIcon },
  { id: 'costs', label: 'Cost Optimization', icon: CashIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-16 md:w-64 bg-gray-900 text-gray-300 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center md:justify-start md:pl-6 h-20 border-b border-gray-700">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <span className="hidden md:block ml-3 text-xl font-bold">Inv-Intel</span>
      </div>
      <nav className="flex-1 px-2 md:px-4 py-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as ViewType)}
            className={`flex items-center justify-center md:justify-start w-full py-2.5 px-4 rounded-lg transition-colors duration-200 ${
              activeView === item.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="hidden md:block ml-4 text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
