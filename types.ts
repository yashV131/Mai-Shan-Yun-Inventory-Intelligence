
export interface Recipe {
  itemName: string;
  ingredients: Record<string, number>;
}

export interface Shipment {
  ingredient: string;
  quantity: number;
  unit: string;
  shipments: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'unknown';
}

export interface MonthlySales {
  [itemName: string]: number;
}

export interface SalesData {
  [month: string]: MonthlySales;
}

export interface IngredientUsage {
  name: string;
  usage: number;
}

export interface InventoryLevel {
    name: string;
    purchased: number;
    used: number;
    net: number;
}

export interface MonthlyData {
    ingredientUsage: IngredientUsage[];
    inventoryLevels: InventoryLevel[];
}

export interface Forecast {
    [ingredient: string]: number;
}

export interface SalesDetail {
    name: string;
    count: number;
    amount: number;
}

export interface MonthlySalesDetails {
    byItem: SalesDetail[];
    byCategory: SalesDetail[];
    byGroup: SalesDetail[];
}

export interface ReorderPrediction {
    name: string;
    endOfMonthStock: number;
    avgDailyUsage: number;
    daysLeft: number;
    status: 'Re-order Now' | 'Sufficient Stock';
}