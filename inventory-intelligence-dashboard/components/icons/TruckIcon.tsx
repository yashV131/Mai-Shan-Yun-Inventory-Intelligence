
import React from 'react';

const TruckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17H6V6h10v4l4 4H13z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 17H4a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v5" />
  </svg>
);

export default TruckIcon;
