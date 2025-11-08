
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, actions }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 sm:p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 sm:mb-0">{title}</h3>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  );
};

export default Card;
