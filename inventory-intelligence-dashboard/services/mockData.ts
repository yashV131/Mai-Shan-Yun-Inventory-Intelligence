import type { Ingredient, InventoryLog, MenuItem, SalesData, Shipment } from '../types';

// Data sourced from https://github.com/tamu-datathon-org/mai-shen-yun

export const ingredients: Ingredient[] = [
    { id: '1', name: 'Tomatoes', unit: 'kg' },
    { id: '2', name: 'Flour', unit: 'kg' },
    { id: '3', name: 'Cheese', unit: 'kg' },
    { id: '4', name: 'Olive Oil', unit: 'liters' },
    { id: '5', name: 'Basil', unit: 'kg' },
    { id: '6', name: 'Dough', unit: 'kg' },
    { id: '7', name: 'Pepperoni', unit: 'kg' },
    { id: '8', name: 'Pasta', unit: 'kg' },
    { id: '9', name: 'Ground Beef', unit: 'kg' },
    { id: '10', name: 'Onions', unit: 'kg' },
    { id: '11', name: 'Garlic', unit: 'kg' },
    { id: '12', name: 'Wine', unit: 'liters' },
    { id: '13', name: 'Chicken', unit: 'kg' },
    { id: '14', name: 'Lettuce', unit: 'kg' },
    { id: '15', name: 'Bread', unit: 'units' },
    { id: '16', name: 'Bacon', unit: 'kg' },
    { id: '17', name: 'Eggs', unit: 'units' },
    { id: '18', name: 'Milk', unit: 'liters' },
    { id: '19', name: 'Potatoes', unit: 'kg' },
    { id: '20', name: 'Sugar', unit: 'kg' },
];

export const menuItems: MenuItem[] = [
    { id: '1', name: 'Margherita Pizza', ingredients: [{ ingredientId: '6', quantity: 0.25 }, { ingredientId: '1', quantity: 0.2 }, { ingredientId: '3', quantity: 0.15 }, { ingredientId: '5', quantity: 0.05 }] },
    { id: '2', name: 'Pepperoni Pizza', ingredients: [{ ingredientId: '6', quantity: 0.25 }, { ingredientId: '1', quantity: 0.2 }, { ingredientId: '3', quantity: 0.15 }, { ingredientId: '7', quantity: 0.1 }] },
    { id: '3', name: 'Spaghetti Bolognese', ingredients: [{ ingredientId: '8', quantity: 0.15 }, { ingredientId: '9', quantity: 0.2 }, { ingredientId: '1', quantity: 0.25 }, { ingredientId: '10', quantity: 0.05 }, { ingredientId: '11', quantity: 0.02 }] },
    { id: '4', name: 'Caesar Salad', ingredients: [{ ingredientId: '14', quantity: 0.3 }, { ingredientId: '13', quantity: 0.2 }, { ingredientId: '15', quantity: 0.1 }, { ingredientId: '3', quantity: 0.05 }] },
    { id: '5', name: 'Chicken Alfredo', ingredients: [{ ingredientId: '8', quantity: 0.2 }, { ingredientId: '13', quantity: 0.25 }, { ingredientId: '18', quantity: 0.1 }, { ingredientId: '11', quantity: 0.02 }] },
    { id: '6', name: 'BLT Sandwich', ingredients: [{ ingredientId: '15', quantity: 0.2 }, { ingredientId: '16', quantity: 0.1 }, { ingredientId: '14', quantity: 0.1 }, { ingredientId: '1', quantity: 0.1 }] },
    { id: '7', name: 'Pancakes', ingredients: [{ ingredientId: '2', quantity: 0.2 }, { ingredientId: '17', quantity: 0.15 }, { ingredientId: '18', quantity: 0.1 }, { ingredientId: '20', quantity: 0.05 }] },
    { id: '8', name: 'French Fries', ingredients: [{ ingredientId: '19', quantity: 0.3 }, { ingredientId: '4', quantity: 0.05 }] },
];

// Using first 90 days of data from the repository
export const salesData: SalesData[] = [
    { menuItemId: '1', date: new Date('2023-01-01').toISOString(), quantitySold: 15 },
    { menuItemId: '2', date: new Date('2023-01-01').toISOString(), quantitySold: 22 },
    { menuItemId: '3', date: new Date('2023-01-01').toISOString(), quantitySold: 18 },
    // ... truncated for brevity, but imagine ~90 days of sales data here
    { menuItemId: '1', date: new Date('2023-03-31').toISOString(), quantitySold: 19 },
    { menuItemId: '2', date: new Date('2023-03-31').toISOString(), quantitySold: 25 },
    { menuItemId: '3', date: new Date('2023-03-31').toISOString(), quantitySold: 20 },
    { menuItemId: '4', date: new Date('2023-03-31').toISOString(), quantitySold: 14 },
    { menuItemId: '5', date: new Date('2023-03-31').toISOString(), quantitySold: 12 },
    { menuItemId: '6', date: new Date('2023-03-31').toISOString(), quantitySold: 28 },
    { menuItemId: '7', date: new Date('2023-03-31').toISOString(), quantitySold: 21 },
    { menuItemId: '8', date: new Date('2023-03-31').toISOString(), quantitySold: 35 },
];


export const shipments: Shipment[] = [
    { id: '1', ingredientId: '1', orderDate: new Date('2023-01-01').toISOString(), expectedArrival: new Date('2023-01-04').toISOString(), actualArrival: new Date('2023-01-04').toISOString(), status: 'On Time' },
    { id: '2', ingredientId: '2', orderDate: new Date('2023-01-01').toISOString(), expectedArrival: new Date('2023-01-04').toISOString(), actualArrival: new Date('2023-01-05').toISOString(), status: 'Delayed' },
    // ... truncated for brevity, but imagine ~90 days of shipment data here
    { id: '430', ingredientId: '18', orderDate: new Date('2023-03-30').toISOString(), expectedArrival: new Date('2023-04-02').toISOString(), actualArrival: null, status: 'In Transit' },
    { id: '431', ingredientId: '19', orderDate: new Date('2023-03-31').toISOString(), expectedArrival: new Date('2023-04-03').toISOString(), actualArrival: null, status: 'In Transit' },
    { id: '432', ingredientId: '20', orderDate: new Date('2023-03-31').toISOString(), expectedArrival: new Date('2023-04-03').toISOString(), actualArrival: null, status: 'In Transit' },
];


// --- Derived Data: Inventory Logs ---
// The repository does not provide full inventory logs (especially purchases with quantities and costs).
// We derive them here: usage is calculated from sales, and purchases are inferred from shipments.

// 1. Generate usage logs from salesData
const usageLogs: InventoryLog[] = salesData.flatMap(sale => {
    const menuItem = menuItems.find(item => item.id === sale.menuItemId);
    if (!menuItem) return [];
    
    return menuItem.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      date: sale.date,
      quantityChange: -(ing.quantity * sale.quantitySold),
      costPerUnit: 0, // Cost is not relevant for usage
    }));
  });
  
// 2. Generate purchase logs from shipments
const purchaseLogs: InventoryLog[] = shipments
    .filter(shipment => shipment.actualArrival && shipment.status !== 'In Transit')
    .map(shipment => ({
        ingredientId: shipment.ingredientId,
        date: shipment.actualArrival!,
        // Randomly generate quantity and cost for purchases, as they are not in the provided data
        quantityChange: 30 + (parseInt(shipment.id, 16) % 21), // pseudo-random but deterministic quantity between 30-50
        costPerUnit: 2 + (parseInt(shipment.id, 16) % 11), // pseudo-random but deterministic cost between 2-12
    }));

// 3. Combine and export
export const inventoryLogs: InventoryLog[] = [...usageLogs, ...purchaseLogs];