
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Recipe, Shipment, SalesData, MonthlyData, Forecast, MonthlySalesDetails, ReorderPrediction } from '../types';
import { recipeCsvData, shipmentCsvData, initialSalesData, initialSalesDetails } from '../data/mockData';
import { parseRecipes, parseShipments, parseSales, parseSalesDetails, processUploadedXlsx, calculateAllMonthsData, calculateReorderPredictions, calculateRestockRecommendations } from '../services/dataService';
import { getForecast, getInventoryAnalysis } from '../services/geminiService';

export const useInventoryData = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [salesData, setSalesData] = useState<SalesData>({});
  const [salesDetails, setSalesDetails] = useState<Record<string, MonthlySalesDetails>>({});
  
  const [allMonthsCalculatedData, setAllMonthsCalculatedData] = useState<Record<string, MonthlyData>>({});
  
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [isForecasting, setIsForecasting] = useState(false);
  const [inventoryAnalysis, setInventoryAnalysis] = useState<string | null>(null);
  const [isAnalyzingInventory, setIsAnalyzingInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial data load from mock data
    const parsedRecipes = parseRecipes(recipeCsvData);
    const parsedShipments = parseShipments(shipmentCsvData);
    
    const parsedSalesData: SalesData = {};
    Object.keys(initialSalesData).forEach(month => {
      parsedSalesData[month] = parseSales(initialSalesData[month]);
    });

    const parsedSalesDetails: Record<string, MonthlySalesDetails> = {};
    Object.keys(initialSalesDetails).forEach(month => {
        const monthData = initialSalesDetails[month];
        parsedSalesDetails[month] = {
            byItem: parseSalesDetails(monthData.byItem, 'Item Name'),
            byCategory: parseSalesDetails(monthData.byCategory, 'Category'),
            byGroup: parseSalesDetails(monthData.byGroup, 'Group'),
        };
    });
    
    setRecipes(parsedRecipes);
    setShipments(parsedShipments);
    setSalesData(parsedSalesData);
    setSalesDetails(parsedSalesDetails);
    
    const months = Object.keys(parsedSalesData);
    setAvailableMonths(months);
    setSelectedMonth(months[months.length - 1]); // Select the latest month by default
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(salesData).length > 0 && recipes.length > 0 && shipments.length > 0) {
        const calculatedData = calculateAllMonthsData(salesData, recipes, shipments);
        setAllMonthsCalculatedData(calculatedData);
    }
  }, [salesData, recipes, shipments]);

  // Fix: Moved derived data calculations before their usage in callbacks.
  const currentMonthData = useMemo(() => {
    return allMonthsCalculatedData[selectedMonth] || { ingredientUsage: [], inventoryLevels: [] };
  }, [selectedMonth, allMonthsCalculatedData]);

  const currentMonthSalesDetails = useMemo(() => {
    return salesDetails[selectedMonth] || { byItem: [], byCategory: [], byGroup: [] };
  }, [selectedMonth, salesDetails]);

  // Prefer restock recommendations derived from shipments + sales data for the selected month.
  const reorderPredictions = useMemo(() => {
    if (!selectedMonth) return [];
    // Use shipments + sales + recipes to calculate restock needs for selectedMonth
    return calculateRestockRecommendations(salesData, recipes, shipments, selectedMonth);
  }, [salesData, recipes, shipments, selectedMonth]);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      const { monthName, sales } = await processUploadedXlsx(file);
      setSalesData(prevData => ({ ...prevData, [monthName]: sales }));
      
      if (!availableMonths.includes(monthName)) {
        setAvailableMonths(prev => [...prev, monthName]);
         // Add empty sales details for the new month to prevent crashes
        setSalesDetails(prev => ({
            ...prev,
            [monthName]: { byItem: [], byCategory: [], byGroup: [] }
        }));
      }
      setSelectedMonth(monthName);
    } catch (err: any) {
      console.error("Error processing file:", err);
      setError("Failed to process the uploaded file. Please ensure it's a valid .xlsx file in the correct format.");
    }
  // Fix: Added all dependencies to the dependency array.
  }, [availableMonths, setError, setSalesData, setAvailableMonths, setSalesDetails, setSelectedMonth]);

  const handleGenerateForecast = useCallback(async () => {
    setIsForecasting(true);
    setError(null);
    setForecast(null);
    const allMonthsUsage = Object.fromEntries(
      // Fix: Add type assertion to fix "property does not exist on type 'unknown'" error.
      Object.entries(allMonthsCalculatedData).map(([month, data]) => [month, (data as MonthlyData).ingredientUsage])
    );
    const result = await getForecast(salesData, allMonthsUsage, selectedMonth);
    if (result) {
        setForecast(result);
    } else {
        setError("Failed to generate forecast. Please check your API key and try again.");
    }
    setIsForecasting(false);
  // Fix: Added all dependencies to the dependency array.
  }, [salesData, allMonthsCalculatedData, selectedMonth, setIsForecasting, setError, setForecast]);

  const handleGenerateInventoryAnalysis = useCallback(async () => {
    setIsAnalyzingInventory(true);
    setError(null);
    setInventoryAnalysis(null);
    const result = await getInventoryAnalysis(currentMonthData.inventoryLevels, selectedMonth);
    if (result) {
        setInventoryAnalysis(result);
    } else {
        setError("Failed to generate inventory analysis.");
    }
    setIsAnalyzingInventory(false);
  // Fix: Added all dependencies to the dependency array.
  }, [currentMonthData, selectedMonth, setIsAnalyzingInventory, setError, setInventoryAnalysis]);

  return {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    salesData,
    currentMonthData,
    currentMonthSalesDetails,
    reorderPredictions,
    handleFileUpload,
    handleGenerateForecast,
    forecast,
    isForecasting,
    inventoryAnalysis,
    isAnalyzingInventory,
    handleGenerateInventoryAnalysis,
    error,
    setError,
  };
};