
import * as XLSX from 'xlsx';
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

export const parseSales = (csvText: string): MonthlySales => {
    const rows = parseCsv(csvText);
    const sales: MonthlySales = {};
    if (rows.length === 0) return sales;
    rows.slice(1).forEach(row => {
        if (row[0] && row[1]) {
            sales[row[0].trim()] = parseInt(row[1]);
        }
    });
    return sales;
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


export const processUploadedXlsx = (file: File): Promise<{ monthName: string; sales: MonthlySales }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet) as { "Item name": string, "Sales": number }[];
                
                const sales: MonthlySales = {};
                json.forEach(row => {
                    if (row["Item name"] && row.Sales) {
                        sales[row["Item name"]] = row.Sales;
                    }
                });
                
                // Extract month name from filename, e.g., "April_sales.xlsx" -> "April"
                const monthName = file.name.split(/[_.]/)[0];
                const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                
                resolve({ monthName: capitalizedMonthName, sales });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
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

        // Build ingredient-level inventory entries only for ingredients that have shipment (purchase) data
        const ingredientLevels = Object.keys(monthlyPurchases).map(ingName => {
            const purchased = monthlyPurchases[ingName] || 0;
            const used = ingredientUsage[ingName] || 0;
            return {
                name: ingName,
                purchased,
                used,
                net: purchased - used
            };
        }).sort((a,b)=>a.name.localeCompare(b.name));

        // Build item-level inventory entries by allocating ingredient purchases proportionally to each item's usage
        const itemLevels: { name: string, purchased: number, used: number, net: number }[] = [];
        // Precompute total usage per ingredient for proportional allocation
        const totalIngredientUsage = { ...ingredientUsage };

        Object.keys(monthlySales).forEach(itemName => {
            const unitsSold = monthlySales[itemName] || 0;
            if (unitsSold <= 0) return;
            const recipe = recipes.find(r => r.itemName === itemName);
            // Compute used grams for this item (sum of ingQty * unitsSold)
            let usedGrams = 0;
            if (recipe) {
                Object.entries(recipe.ingredients).forEach(([ingName, ingQty]) => {
                    usedGrams += ingQty * unitsSold;
                });
            }

            // Estimate purchased grams for this item by allocating ingredient purchases proportionally
            let purchasedEstimate = 0;
            if (recipe) {
                Object.entries(recipe.ingredients).forEach(([ingName, ingQty]) => {
                    const ingTotalUsage = totalIngredientUsage[ingName] || 0;
                    const ingMonthlyPurchased = monthlyPurchases[ingName] || 0;
                    const itemIngUsage = ingQty * unitsSold;
                    if (ingMonthlyPurchased > 0 && ingTotalUsage > 0) {
                        const fraction = itemIngUsage / ingTotalUsage;
                        purchasedEstimate += ingMonthlyPurchased * fraction;
                    }
                });
            }

            // Include this item-level entry only if we were able to estimate purchased from shipments
            if (purchasedEstimate > 0) {
                itemLevels.push({
                    name: itemName,
                    purchased: Math.round(purchasedEstimate),
                    used: Math.round(usedGrams),
                    net: Math.round(purchasedEstimate - usedGrams)
                });
            }
        });

        // Final inventory levels include ingredient-level entries (with shipments) and item-level estimates (when possible)
        const inventoryLevels = [...ingredientLevels, ...itemLevels];

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

/**
 * Calculate restock recommendations for a given month using shipments and sales (via recipes).
 * - salesData: map month -> { itemName: count }
 * - recipes: recipe list to derive ingredient usage per item
 * - shipments: shipment definitions used to compute monthly purchases
 * Returns ReorderPrediction[] for the supplied month (or empty array if month not found)
 */
import { RestockDetail } from '../types';
import { monthlyInventorySummary } from '../data/mockData';

export const calculateRestockRecommendations = (salesData: SalesData, recipes: Recipe[], shipments: Shipment[], month: string): RestockDetail[] => {
    if (!salesData || !recipes || !shipments || !month) return [];

    const monthlyPurchases = calculateMonthlyPurchases(shipments);
    const monthSales = salesData[month];
    if (!monthSales) return [];

    // Compute ingredient usage for the month from recipes and monthSales
    const ingredientUsage: Record<string, number> = {};
    recipes.forEach(recipe => {
        const unitsSold = monthSales[recipe.itemName] || 0;
        if (unitsSold > 0) {
            Object.entries(recipe.ingredients).forEach(([ingName, ingQty]) => {
                ingredientUsage[ingName] = (ingredientUsage[ingName] || 0) + (ingQty * unitsSold);
            });
        }
    });

    // If we have an explicit monthly summary provided, prefer it (user-provided authoritative numbers)
    const provided = monthlyInventorySummary[month];
    if (provided) {
        const detailsFromProvided: RestockDetail[] = Object.keys(provided).map(ingName => {
            const entry = provided[ingName];
            const purchased = Math.round(entry.shipment || 0);
            const consumption = Math.round(entry.consumption || 0);
            // prefer provided endingStock if available for stockLeft, otherwise compute purchased - consumption
            const stockLeft = Math.round(typeof entry.endingStock === 'number' ? entry.endingStock : Math.max(0, purchased - consumption));
            const status: RestockDetail['status'] = purchased < consumption ? 'Understocked' : 'Overstocked';
            try { console.debug('[restock:provided] month=%s ingredient=%s purchased=%d consumption=%d stockLeft=%d', month, ingName, purchased, consumption, stockLeft); } catch (e) {}
            return { name: ingName, purchased, consumption, stockLeft, status };
        });
        return detailsFromProvided.sort((a,b) => a.stockLeft - b.stockLeft);
    }

    // Build restock details for ingredients actually consumed in this month (so results change month-to-month)
    const details: RestockDetail[] = Object.keys(ingredientUsage)
        .filter(ingName => (ingredientUsage[ingName] || 0) > 0) // only ingredients used this month
        .map(ingName => {
            const consumption = ingredientUsage[ingName] || 0;
            const purchased = monthlyPurchases[ingName] || 0; // may be 0 if no shipment record
            const stockLeft = Math.max(0, Math.round(purchased - consumption));

            // Debug: log per-ingredient values for the selected month to browser console (development help)
            try { console.debug('[restock] month=%s ingredient=%s purchased=%d consumption=%d stockLeft=%d', month, ingName, Math.round(purchased), Math.round(consumption), stockLeft); } catch (e) {}

            const status: RestockDetail['status'] = purchased < consumption ? 'Understocked' : 'Overstocked';

            return {
                name: ingName,
                purchased: Math.round(purchased),
                consumption: Math.round(consumption),
                stockLeft,
                status,
            };
        });

    // Sort by stockLeft ascending (understocked first)
    return details.sort((a, b) => a.stockLeft - b.stockLeft);
};