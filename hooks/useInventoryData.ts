
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Recipe, Shipment, SalesData, MonthlyData, Forecast, MonthlySalesDetails, ReorderPrediction, MonthlySales } from '../types';
import { parseRecipes, parseShipments, parseSalesDetails, uploadSalesData, calculateAllMonthsData, calculateReorderPredictions } from '../services/dataService';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const recipePath = '/data/ingredient.csv';
        const shipmentPath = '/data/shipment.csv';
        const monthsToLoad = ["January", "February", "March"];

        const [recipeRes, shipmentRes] = await Promise.all([
          fetch(recipePath),
          fetch(shipmentPath),
        ]);

        if (!recipeRes.ok) throw new Error(`Failed to fetch recipes at ${recipePath}`);
        if (!shipmentRes.ok) throw new Error(`Failed to fetch shipments at ${shipmentPath}`);

        const recipeCsvText = await recipeRes.text();
        const shipmentCsvText = await shipmentRes.text();
        
        const parsedRecipes = parseRecipes(recipeCsvText);
        const parsedShipments = parseShipments(shipmentCsvText);

        const salesPromises = monthsToLoad.map(async (month) => {
          const detailsByItemRes = await fetch(`/data/monthly_data/${month}_ItemName.csv`);
          const detailsByCategoryRes = await fetch(`/data/monthly_data/${month}_Category.csv`);
          const detailsByGroupRes = await fetch(`/data/monthly_data/${month}_Group.csv`);

          if (!detailsByItemRes.ok || !detailsByCategoryRes.ok || !detailsByGroupRes.ok) {
            console.warn(`Could not load full sales details for ${month}. The monthly sales chart may be empty.`);
            return {
                month,
                sales: {},
                salesDetails: { byItem: [], byCategory: [], byGroup: [] }
            };
          }

          const detailsByItemCsv = await detailsByItemRes.text();
          const detailsByCategoryCsv = await detailsByCategoryRes.text();
          const detailsByGroupCsv = await detailsByGroupRes.text();

          const byItem = parseSalesDetails(detailsByItemCsv, 'Item Name');
          const byCategory = parseSalesDetails(detailsByCategoryCsv, 'Category');
          const byGroup = parseSalesDetails(detailsByGroupCsv, 'Group');

          const sales: MonthlySales = {};
          byItem.forEach(item => {
              if (item.name && item.count) {
                  sales[item.name] = item.count;
              }
          });
          
          return {
            month,
            sales: sales,
            salesDetails: { byItem, byCategory, byGroup }
          };
        });

        const monthlyDataResults = await Promise.all(salesPromises);
        const parsedSalesData: SalesData = {};
        const parsedSalesDetails: Record<string, MonthlySalesDetails> = {};
        monthlyDataResults.forEach(result => {
          parsedSalesData[result.month] = result.sales;
          parsedSalesDetails[result.month] = result.salesDetails;
        });

        setRecipes(parsedRecipes);
        setShipments(parsedShipments);
        setSalesData(parsedSalesData);
        setSalesDetails(parsedSalesDetails);
        setAvailableMonths(monthsToLoad);
        setSelectedMonth(monthsToLoad[monthsToLoad.length - 1]);

      } catch (err: any) {
        console.error("Failed to load initial data:", err);
        setError(`Failed to load data from server. Ensure data files exist. Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);


  useEffect(() => {
    if (Object.keys(salesData).length > 0 && recipes.length > 0 && shipments.length > 0) {
        const calculatedData = calculateAllMonthsData(salesData, recipes, shipments);
        setAllMonthsCalculatedData(calculatedData);
    }
  }, [salesData, recipes, shipments]);

  const currentMonthData = useMemo(() => {
    return allMonthsCalculatedData[selectedMonth] || { ingredientUsage: [], inventoryLevels: [] };
  }, [selectedMonth, allMonthsCalculatedData]);

  const currentMonthSalesDetails = useMemo(() => {
    return salesDetails[selectedMonth] || { byItem: [], byCategory: [], byGroup: [] };
  }, [selectedMonth, salesDetails]);

  const reorderPredictions = useMemo(() => {
    if (!currentMonthData) return [];
    return calculateReorderPredictions(currentMonthData.inventoryLevels, currentMonthData.ingredientUsage);
  }, [currentMonthData]);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      // Step 1: "Upload" the file to the (simulated) backend for processing.
      const { monthName } = await uploadSalesData(file);

      // Step 2: Fetch the newly created CSV files.
      const detailsByItemRes = await fetch(`/data/monthly_data/${monthName}_ItemName.csv`);
      const detailsByCategoryRes = await fetch(`/data/monthly_data/${monthName}_Category.csv`);
      const detailsByGroupRes = await fetch(`/data/monthly_data/${monthName}_Group.csv`);

      if (!detailsByItemRes.ok || !detailsByCategoryRes.ok || !detailsByGroupRes.ok) {
        throw new Error(`Could not load processed sales details for ${monthName}. Ensure the backend processed the file correctly and the CSVs are available.`);
      }

      const detailsByItemCsv = await detailsByItemRes.text();
      const detailsByCategoryCsv = await detailsByCategoryRes.text();
      const detailsByGroupCsv = await detailsByGroupRes.text();
      
      const byItem = parseSalesDetails(detailsByItemCsv, 'Item Name');
      const byCategory = parseSalesDetails(detailsByCategoryCsv, 'Category');
      const byGroup = parseSalesDetails(detailsByGroupCsv, 'Group');

      const sales: MonthlySales = {};
       byItem.forEach(item => {
        if (item.name && item.count) {
            sales[item.name] = item.count;
        }
      });
      
      // Step 3: Update the application state with the new data.
      setSalesData(prevData => ({ ...prevData, [monthName]: sales }));
      setSalesDetails(prev => ({
          ...prev,
          [monthName]: { byItem, byCategory, byGroup }
      }));
      
      if (!availableMonths.includes(monthName)) {
        setAvailableMonths(prev => [...prev, monthName]);
      }
      setSelectedMonth(monthName);

    } catch (err: any) {
      console.error("Error processing file:", err);
      setError(`Failed to process the uploaded file. ${err.message}`);
    } finally {
        setIsUploading(false);
    }
  }, [availableMonths]);

  const handleGenerateForecast = useCallback(async () => {
    setIsForecasting(true);
    setError(null);
    setForecast(null);
    const allMonthsUsage = Object.fromEntries(
      Object.entries(allMonthsCalculatedData).map(([month, data]) => [month, (data as MonthlyData).ingredientUsage])
    );
    const result = await getForecast(salesData, allMonthsUsage, selectedMonth);
    if (result) {
        setForecast(result);
    } else {
        setError("Failed to generate forecast. Please check your API key and try again.");
    }
    setIsForecasting(false);
  }, [salesData, allMonthsCalculatedData, selectedMonth]);

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
  }, [currentMonthData.inventoryLevels, selectedMonth]);

  return {
    isLoading,
    isUploading,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
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