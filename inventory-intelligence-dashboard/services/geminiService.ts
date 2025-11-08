
import { GoogleGenAI, Type } from "@google/genai";
import type { SalesData, MenuItem, ForecastData } from '../types';

// Assume process.env.API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const forecastIngredientDemand = async (
  historicalSales: SalesData[],
  menuItems: MenuItem[]
): Promise<ForecastData[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const prompt = `
    As a supply chain analyst for a restaurant, your task is to forecast ingredient demand for the next 30 days.
    
    Here is the historical sales data for the last 90 days:
    ${JSON.stringify(historicalSales.slice(-100))}

    Here is the list of menu items and their recipes (ingredient quantities per item sold):
    ${JSON.stringify(menuItems)}

    Based on this data, predict the total quantity of each ingredient needed for the next 30 days.
    Consider potential trends, but provide a conservative estimate.
    Return the forecast as a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ingredientName: {
                type: Type.STRING,
                description: 'The name of the ingredient.',
              },
              forecastedDemand: {
                type: Type.NUMBER,
                description: 'The forecasted total demand for this ingredient for the next 30 days.',
              },
              unit: {
                type: Type.STRING,
                description: 'The unit of measurement for the ingredient (e.g., kg, liters, units).',
              },
            },
            required: ["ingredientName", "forecastedDemand", "unit"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    // Validate the parsed data structure
    if (Array.isArray(parsedData) && parsedData.every(item => 'ingredientName' in item && 'forecastedDemand' in item && 'unit' in item)) {
        return parsedData as ForecastData[];
    } else {
        throw new Error("Parsed data does not match the expected ForecastData structure.");
    }

  } catch (error) {
    console.error("Error forecasting ingredient demand:", error);
    throw new Error("Failed to get forecast from Gemini API. Check console for details.");
  }
};
