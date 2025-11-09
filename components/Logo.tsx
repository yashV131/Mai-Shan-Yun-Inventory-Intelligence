import React from 'react';
import { logoBase64 } from '../data/logo';

const logoStyle: React.CSSProperties = {
  filter: 'invert(1)', // Make the black logo white for dark theme
  height: '50px',
};

export const Logo: React.FC = () => (
  <img src={logoBase64} alt="Mai Shan Yun Logo" style={logoStyle} />
);
