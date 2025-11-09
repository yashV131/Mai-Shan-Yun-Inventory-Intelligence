
import React from 'react';
import { useInventoryData } from '../hooks/useInventoryData';
import { Header } from './Header';
import { ChartCard } from './ChartCard';
import { IngredientUsageChart } from './IngredientUsageChart';
import { InventoryLevelsChart } from './InventoryLevelsChart';
import { ForecastCard } from './ForecastCard';
import { MonthlySalesChart } from './MonthlySalesChart';
import { ReorderForecast } from './ReorderForecast';
import { InventoryAnalysis } from './InventoryAnalysis';
import { ChartBarIcon, AlertTriangleIcon, ClockIcon } from './icons';

const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
        <p className="text-text-secondary mt-4 text-lg">{message}</p>
    </div>
);

const UploadingOverlay: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <p className="text-text-primary mt-4 text-xl font-semibold">Processing Uploaded File...</p>
        <p className="text-text-secondary mt-1">This may take a moment.</p>
    </div>
);


export const Dashboard: React.FC = () => {
    const {
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
        isLoading,
        isUploading,
    } = useInventoryData();

    if (isLoading) {
        return <LoadingScreen message="Loading Inventory Data..." />;
    }

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {isUploading && <UploadingOverlay />}
            <Header
                selectedMonth={selectedMonth}
                availableMonths={availableMonths}
                onMonthChange={setSelectedMonth}
                onFileUpload={handleFileUpload}
                isUploading={isUploading}
            />

            {error && (
                 <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-lg relative mb-6 flex items-center" role="alert">
                    <AlertTriangleIcon className="w-6 h-6 mr-3 text-red-300"/>
                    <span className="block sm:inline">{error}</span>
                    <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-300">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Row 1 */}
                <div className="lg:col-span-2 h-[400px]">
                    <ChartCard title={`Ingredient Usage - ${selectedMonth}`} icon={<ChartBarIcon className="w-6 h-6" />}>
                        <IngredientUsageChart data={currentMonthData.ingredientUsage} />
                    </ChartCard>
                </div>
                
                <div className="lg:row-span-2">
                    <ForecastCard
                        forecast={forecast}
                        isForecasting={isForecasting}
                        onGenerateForecast={handleGenerateForecast}
                        selectedMonth={selectedMonth}
                    />
                </div>

                {/* Row 2 */}
                <div className="lg:col-span-2 h-[500px]">
                     <ChartCard title={`Monthly Sales - ${selectedMonth}`} icon={<ChartBarIcon className="w-6 h-6" />}>
                        <MonthlySalesChart data={currentMonthSalesDetails} />
                    </ChartCard>
                </div>
                
                {/* Row 3 - Full Width */}
                <div className="lg:col-span-3 h-[550px]">
                     <ChartCard title={`Inventory Hub - ${selectedMonth}`} icon={<ChartBarIcon className="w-6 h-6" />}>
                        <div className="flex flex-col md:flex-row h-full gap-4 -m-4 md:-m-6">
                            <div className="w-full md:w-2/3 h-full p-4 md:p-6">
                                <InventoryLevelsChart data={currentMonthData.inventoryLevels} />
                            </div>
                            <div className="w-full md:w-1/3 h-full border-t md:border-t-0 md:border-l border-primary">
                                <InventoryAnalysis
                                    analysis={inventoryAnalysis}
                                    isAnalyzing={isAnalyzingInventory}
                                    onGenerate={handleGenerateInventoryAnalysis}
                                />
                            </div>
                        </div>
                    </ChartCard>
                </div>

                {/* Row 4 - Full Width */}
                <div className="lg:col-span-3 h-[400px]">
                    <ChartCard title="Re-order Forecast" icon={<ClockIcon className="w-6 h-6" />}>
                        <ReorderForecast data={reorderPredictions} />
                    </ChartCard>
                </div>

            </div>
        </main>
    );
};