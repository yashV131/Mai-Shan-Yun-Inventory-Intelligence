
import { Recipe, Shipment, MonthlySales, SalesData, SalesDetail, InventoryLevel, IngredientUsage, ReorderPrediction } from '../types';

const LBS_TO_GRAMS = 453.592;
const AVG_DAYS_IN_MONTH = 30;
const REORDER_THRESHOLD_DAYS = 7; // Assumed lead time for shipments

const INGREDIENT_NAME_MAP: Record<string, string> = {
    'braised beef used (g)': 'Beef',
    'braised chicken(g)': 'Chicken',
    'braised pork(g)': 'Pork',
    'egg(count)': 'Egg',
    'rice(g)': 'Rice',
    'ramen (count)': 'Ramen',
    'rice noodles(g)': 'Rice Noodles',
    'chicken thigh (pcs)': 'Chicken',
    'chicken wings (pcs)': 'Chicken Wings',
    'flour (g)': 'Flour',
    'pickle cabbage': 'Pickle Cabbage',
    'green onion': 'Green Onion',
    'cilantro': 'Cilantro',
    'white onion': 'White onion',
    'peas(g)': 'Peas',
    'carrot(g)': 'Carrot',
    'boychoy(g)': 'Bokchoy',
    'tapioca starch': 'Tapioca Starch'
};

const normalizeIngredientName = (name: string): string => {
    const lowerCaseName = name.toLowerCase().trim();
    return INGREDIENT_NAME_MAP[lowerCaseName] || name;
};

const parseCsv = (csvText: string): string[][] => {
    if (!csvText) return [];
    return csvText.split('\n').filter(Boolean).map(row => {
        // Simple CSV parser that handles quotes
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    });
};

export const parseRecipes = (csvText: string): Recipe[] => {
    const rows = parseCsv(csvText);
    if (rows.length === 0) return [];
    const headers = rows[0].map(h => h.trim());
    return rows.slice(1).map(row => {
        const recipe: Recipe = {
            itemName: row[0],
            ingredients: {},
        };
        headers.slice(1).forEach((header, index) => {
            const value = parseFloat(row[index + 1]);
            if (!isNaN(value) && value > 0) {
                const ingredientName = normalizeIngredientName(header);
                recipe.ingredients[ingredientName] = value;
            }
        });
        return recipe;
    });
};

export const parseShipments = (csvText: string): Shipment[] => {
    const rows = parseCsv(csvText);
    if (rows.length === 0) return [];
    return rows.slice(1).map(row => {
        const frequency = row[4]?.trim().toLowerCase() as Shipment['frequency'] || 'unknown';
        return {
            ingredient: normalizeIngredientName(row[0]),
            quantity: parseFloat(row[1]),
            unit: row[2]?.trim(),
            shipments: parseInt(row[3]),
            frequency: ['weekly', 'biweekly', 'monthly'].includes(frequency) ? frequency : 'unknown',
        };
    });
};

const cleanAmount = (amountStr: string): number => {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
};

const cleanCount = (countStr: string): number => {
    if (!countStr) return 0;
    return parseInt(countStr.replace(/,/g, ''), 10);
};

export const parseSalesDetails = (csvText: string, nameKey: 'Item Name' | 'Group' | 'Category'): SalesDetail[] => {
    const rows = parseCsv(csvText);
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));
    const nameIndex = headers.indexOf(nameKey);
    const countIndex = headers.indexOf('Count');
    const amountIndex = headers.indexOf('Amount');

    if (nameIndex === -1 || countIndex === -1 || amountIndex === -1) {
        console.warn(`Could not find required headers ('${nameKey}', 'Count', 'Amount') in CSV.`);
        return [];
    }
    
    return rows.slice(1).map(row => {
        return {
            name: row[nameIndex]?.replace(/"/g, '').trim(),
            count: cleanCount(row[countIndex]),
            amount: cleanAmount(row[amountIndex]),
        };
    }).filter(item => item.name && !isNaN(item.amount) && item.amount > 0);
};


// Simulate uploading to a backend that runs the Python script
export const uploadSalesData = (file: File): Promise<{ monthName: string }> => {
    return new Promise((resolve, reject) => {
        // In a real app, this would be a fetch() call to an API endpoint
        // that handles the file and runs the Python script.
        // Here, we just simulate the delay of uploading and processing.
        console.log(`Simulating upload and processing for ${file.name}...`);
        
        setTimeout(() => {
            try {
                // Extract month name from filename, e.g., "April_sales.xlsx" -> "April"
                const monthNameMatch = file.name.match(/^([a-zA-Z]+)/);
                if (!monthNameMatch) {
                    throw new Error("Could not determine month from filename. Expected format like 'April_sales.xlsx'.");
                }
                const monthName = monthNameMatch[1];
                const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                
                console.log(`Processing complete for ${capitalizedMonthName}. The app will now try to fetch the new CSVs.`);
                resolve({ monthName: capitalizedMonthName });

            } catch (error) {
                console.error("Simulation error:", error);
                reject(error);
            }
        }, 2500); // Simulate a 2.5-second processing time
    });
};


export const calculateMonthlyPurchases = (shipments: Shipment[]): Record<string, number> => {
    const purchases: Record<string, number> = {};

    shipments.forEach(s => {
        let multiplier = 0;
        if (s.frequency === 'weekly') multiplier = 4.33;
        else if (s.frequency === 'biweekly') multiplier = 2.16;
        else if (s.frequency === 'monthly') multiplier = 1;

        let totalQuantity = s.quantity * s.shipments * multiplier;

        if (s.unit === 'lbs') {
            totalQuantity *= LBS_TO_GRAMS;
        }

        purchases[s.ingredient] = (purchases[s.ingredient] || 0) + totalQuantity;
    });
    return purchases;
};

export const calculateAllMonthsData = (salesData: SalesData, recipes: Recipe[], shipments: Shipment[]) => {
    const monthlyPurchases = calculateMonthlyPurchases(shipments);
    const allMonthsData: Record<string, { ingredientUsage: { name: string, usage: number }[], inventoryLevels: { name: string, purchased: number, used: number, net: number }[] }> = {};

    Object.keys(salesData).forEach(month => {
        const monthlySales = salesData[month];
        const ingredientUsage: Record<string, number> = {};

        recipes.forEach(recipe => {
            const unitsSold = monthlySales[recipe.itemName] || 0;
            if (unitsSold > 0) {
                Object.entries(recipe.ingredients).forEach(([ingName, ingQty]) => {
                    ingredientUsage[ingName] = (ingredientUsage[ingName] || 0) + (ingQty * unitsSold);
                });
            }
        });

        const formattedUsage = Object.entries(ingredientUsage).map(([name, usage]) => ({ name, usage }));

        const inventoryLevels = Object.keys(monthlyPurchases).map(ingName => {
            const purchased = monthlyPurchases[ingName] || 0;
            const used = ingredientUsage[ingName] || 0;
            return {
                name: ingName,
                purchased,
                used,
                net: purchased - used
            };
        }).sort((a,b)=>a.name.localeCompare(b.name));

        allMonthsData[month] = { ingredientUsage: formattedUsage, inventoryLevels };
    });

    return allMonthsData;
};

export const calculateReorderPredictions = (inventoryLevels: InventoryLevel[], ingredientUsage: IngredientUsage[]): ReorderPrediction[] => {
    const usageMap = new Map(ingredientUsage.map(item => [item.name, item.usage]));
    
    return inventoryLevels
        .filter(inv => usageMap.has(inv.name) && usageMap.get(inv.name)! > 0)
        .map(inv => {
            const endOfMonthStock = Math.max(0, inv.net);
            const monthlyUsage = usageMap.get(inv.name)!;
            const avgDailyUsage = monthlyUsage / AVG_DAYS_IN_MONTH;
            const daysLeft = avgDailyUsage > 0 ? endOfMonthStock / avgDailyUsage : Infinity;
            
            // FIX: Explicitly type the status to satisfy the ReorderPrediction interface,
            // as TypeScript was incorrectly widening the type to a generic string.
            const status: ReorderPrediction['status'] = daysLeft < REORDER_THRESHOLD_DAYS ? 'Re-order Now' : 'Sufficient Stock';

            return {
                name: inv.name,
                endOfMonthStock: Math.round(endOfMonthStock),
                avgDailyUsage: parseFloat(avgDailyUsage.toFixed(2)),
                daysLeft: Math.floor(daysLeft),
                status: status,
            };
        })
        .sort((a, b) => a.daysLeft - b.daysLeft);
};