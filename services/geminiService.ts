

import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { SalesData, IngredientUsage, Forecast, InventoryLevel } from '../types';

const getNextMonthName = (currentMonthName: string): string => {
    // A simple mapping to get the next month.
    // A more robust solution would use a date library if more date logic were needed.
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    const currentIndex = months.indexOf(currentMonthName);
    if (currentIndex === -1) {
        return "Next Month"; // Fallback
    }
    const nextIndex = (currentIndex + 1) % 12;
    return months[nextIndex];
};

export const getForecast = async (
  salesData: SalesData,
  allMonthsUsage: Record<string, IngredientUsage[]>,
  currentMonthName: string
): Promise<Forecast | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set.");
    // In a real app, you'd want to handle this more gracefully
    alert("Gemini API key is not configured.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const historicalData = Object.keys(salesData).map(month => {
    const top5Usage = allMonthsUsage[month]
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10)
      .map(u => `${u.name}: ${Math.round(u.usage)}g`)
      .join(', ');

    return `Month: ${month}\nTop 10 Ingredient Usage: ${top5Usage}`;
  }).join('\n\n');

  const nextMonthName = getNextMonthName(currentMonthName);

  const prompt = `
You are a supply chain analyst for a restaurant. Based on the following monthly ingredient usage data, predict the required quantity (in grams or pieces) for all key ingredients for the next month. Analyze trends and seasonality if possible from the data provided.

Historical Data:
${historicalData}

Provide a forecast for ${nextMonthName}. Return a list of all key ingredients and their forecasted amounts.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forecast: {
              type: Type.ARRAY,
              description: 'An array of objects, each containing an ingredient name and its forecasted quantity in grams or pieces.',
              items: {
                type: Type.OBJECT,
                properties: {
                  ingredient: {
                    type: Type.STRING,
                    description: 'Name of the ingredient.'
                  },
                  quantity: {
                    type: Type.NUMBER,
                    description: 'Forecasted quantity.'
                  }
                },
                required: ['ingredient', 'quantity']
              }
            },
            reasoning: {
                type: Type.STRING,
                description: "A brief explanation of the forecast logic."
            }
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        console.error("Gemini API returned an empty response for forecast.");
        return null;
    }
    const result = JSON.parse(jsonText);
    
    const forecastObject: Forecast = {};
    if (result.forecast && Array.isArray(result.forecast)) {
        result.forecast.forEach((item: { ingredient: string; quantity: number }) => {
            if (item.ingredient && typeof item.quantity === 'number') {
                forecastObject[item.ingredient] = item.quantity;
            }
        });
    }
    
    return forecastObject;

  } catch (error) {
    console.error("Error fetching forecast from Gemini API:", error);
    if (error instanceof SyntaxError) {
        console.error("Failed to parse JSON response from Gemini API. Response was not valid JSON.");
    }
    return null;
  }
};


export const getInventoryAnalysis = async (inventoryData: InventoryLevel[], month: string): Promise<string | null> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY is not set.");
        alert("Gemini API key is not configured.");
        return null;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const dataSummary = inventoryData
        .map(item => `${item.name}: ${item.net > 0 ? '+' : ''}${Math.round(item.net)}g net (Purchased: ${Math.round(item.purchased)}g, Used: ${Math.round(item.used)}g)`)
        .join('\n');

    const prompt = `
        You are an expert restaurant supply chain analyst. Based on the following net inventory data for the month of ${month}, provide a brief analysis and actionable suggestions.

        Inventory Data (Net = Purchased - Used):
        ${dataSummary}

        Your analysis should:
        1. Identify the top 2-3 most overstocked and understocked items.
        2. Provide specific, actionable suggestions for adjusting the next month's shipments for these items.
        3. Briefly mention that seasonality could affect sales (e.g., "Consider if ${month}'s sales were typical or if seasonal changes are expected").
        
        Keep the response concise, formatted as markdown, and easy to read. Use bullet points for suggestions.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const analysisText = response.text;
        return analysisText;
    } catch (error) {
        console.error("Error fetching inventory analysis from Gemini API:", error);
        return null;
    }
};