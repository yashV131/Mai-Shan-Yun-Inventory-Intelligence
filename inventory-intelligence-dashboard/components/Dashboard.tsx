
import React from 'react';
import type { ViewType } from '../types';
import IngredientUsageChart from './IngredientUsageChart';
import DemandForecastChart from './DemandForecastChart';
import ShipmentTracker from './ShipmentTracker';
import CostAnalysisChart from './CostAnalysisChart';

interface DashboardProps {
  activeView: ViewType;
}

const Dashboard: React.FC<DashboardProps> = ({ activeView }) => {
  return (
    <div className="container mx-auto">
      {activeView === 'insights' && (
        <div className="grid grid-cols-1 gap-6">
          <IngredientUsageChart />
        </div>
      )}
      {activeView === 'forecasting' && (
         <div className="grid grid-cols-1 gap-6">
          <DemandForecastChart />
        </div>
      )}
      {activeView === 'shipments' && (
        <div className="grid grid-cols-1 gap-6">
          <ShipmentTracker />
        </div>
      )}
      {activeView === 'costs' && (
        <div className="grid grid-cols-1 gap-6">
          <CostAnalysisChart />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
