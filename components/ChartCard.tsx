
import React from 'react';

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, icon, children, className }) => {
  return (
    <div className={`bg-card rounded-xl shadow-lg p-4 sm:p-6 flex flex-col h-full ${className}`}>
      <div className="flex items-center mb-4">
        <div className="text-accent mr-3">{icon}</div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="flex-grow w-full min-h-0">
        {children}
      </div>
    </div>
  );
};