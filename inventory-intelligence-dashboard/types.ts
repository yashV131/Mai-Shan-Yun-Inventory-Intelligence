export type ViewType = 'insights' | 'forecasting' | 'shipments' | 'costs';

export interface Ingredient {
  id: string;
  name: string;
  unit: 'kg' | 'liters' | 'units';
}

export interface InventoryLog {
  ingredientId: string;
  date: string; // ISO string
  quantityChange: number; // positive for purchase, negative for usage
  costPerUnit: number;
}

export interface MenuItem {
  id: string;
  name: string;
  ingredients: { ingredientId: string; quantity: number }[];
}

export interface SalesData {
  menuItemId: string;
  date: string; // ISO string
  quantitySold: number;
}

export interface Shipment {
  id: string;
  ingredientId: string;
  orderDate: string; // ISO string
  expectedArrival: string; // ISO string
  actualArrival: string | null; // ISO string or null if not arrived
  status: 'On Time' | 'Delayed' | 'In Transit';
}

export interface ForecastData {
    ingredientName: string;
    forecastedDemand: number;
    unit: string;
}