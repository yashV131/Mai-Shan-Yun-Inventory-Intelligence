import pandas as pd
import numpy as np
from scipy.stats import linregress
import matplotlib.pyplot as plt

# --- 1. Load Data ---

# Map month name to the corresponding file and its index for time series analysis
# We assign May as index 0, so June is 1, July is 2, etc.
# October is included here as index 5, but its data is aggregated and cannot be
# used for ingredient usage calculation based on item-level mapping.
month_files = {
    'June': {'file': 'June_ItemName.csv', 'index': 1},
    'July': {'file': 'July_ItemName.csv', 'index': 2},
    'August': {'file': 'August_ItemName.csv', 'index': 3},
    'September': {'file': 'September_ItemName.csv', 'index': 4},
    'October': {'file': 'October_ItemName.csv', 'index': 5}
}

INGREDIENT_FILE = 'MSY Data - Ingredient.csv'

# Key ingredients to track (UPDATED for better visualization spread)
KEY_INGREDIENTS = [
    'Rice(g)',
    'Rice Noodles(g)',
    'Braised Chicken(g)',
    'Green Onion'
]

# --- NEW: Define a color map for the dashboard styling (UPDATED COLORS) ---
COLOR_MAP = {
    'Rice(g)': '#00bcd4',          # Cyan/Teal
    'Rice Noodles(g)': '#ffc107',  # Amber/Gold
    'Braised Chicken(g)': '#673ab7', # Deep Purple
    'Green Onion': '#e91e63',     # Pink/Red
}
PREDICTION_COLOR = '#212121' # Dark Grey/Black for the prediction highlight

# --- NEW: Define the specific dark background color ---
DASHBOARD_BG_COLOR = '#2d3748'
TEXT_COLOR = 'white'

def load_data():
    """Loads the ingredient usage mapping."""
    try:
        df_ingredients = pd.read_csv(INGREDIENT_FILE)
        # Standardize column names for merging
        df_ingredients.rename(columns={'Item name': 'Item Name'}, inplace=True)
        # Fill NaN usage values with 0, assuming items not listed use 0 of the key ingredients
        # Note: We must ensure all columns in KEY_INGREDIENTS exist before operating on them
        missing_keys = [k for k in KEY_INGREDIENTS if k not in df_ingredients.columns]
        if missing_keys:
            print(f"Error: Ingredients not found in mapping file: {missing_keys}")
            return None
            
        df_ingredients[KEY_INGREDIENTS] = df_ingredients[KEY_INGREDIENTS].fillna(0)
        return df_ingredients
    except FileNotFoundError:
        print(f"Error: Ingredient file '{INGREDIENT_FILE}' not found.")
        return None

def calculate_monthly_usage(df_ingredients):
    """Calculates the total monthly usage for key ingredients across all months."""
    all_usage_data = {}

    for month_name, data in month_files.items():
        file_path = data['file']
        month_index = data['index']
        
        # --- Specific check for October's grouped data ---
        if month_name == 'October' and file_path == 'October_ItemName.csv':
            print(f"\n--- WARNING ---")
            print(f"Skipping ingredient usage calculation for {month_name}. The file '{file_path}' uses aggregated 'Group' data instead of individual item counts, which prevents accurate calculation based on '{INGREDIENT_FILE}'.")
            print(f"The linear trend model will only use data from the item-level files (June-September).\n")
            continue # Skip to the next month
        # ------------------------------------------------

        try:
            # Load monthly sales data
            df_sales = pd.read_csv(file_path)
            
            # Ensure 'Count' column is numeric, coercing errors to 0
            df_sales['Count'] = pd.to_numeric(df_sales['Count'], errors='coerce').fillna(0)
            
            # Merge sales with ingredient mapping
            df_merged = pd.merge(
                df_sales[['Item Name', 'Count']],
                df_ingredients,
                on='Item Name',
                how='inner' # Only consider items present in the ingredient mapping
            )
            
            # Calculate total usage for each key ingredient in the current month
            monthly_usage = {}
            for ingredient in KEY_INGREDIENTS:
                # Total Usage = Sum(Item Count * Ingredient Usage per item)
                total_usage = (df_merged['Count'] * df_merged[ingredient]).sum()
                monthly_usage[ingredient] = total_usage

            all_usage_data[month_name] = {
                'index': month_index,
                'usage': monthly_usage
            }
        
        except FileNotFoundError:
            print(f"Warning: Sales file '{file_path}' not found. Skipping month.")
        except Exception as e:
             print(f"An error occurred while processing {file_path}: {e}")

    return all_usage_data

def predict_may_usage(all_usage_data):
    """
    Predicts May usage using simple linear regression (y = mx + b) 
    based on the trend of the available historical months (June-September).
    May corresponds to a time index of 0.
    """
    # Extract indices and usage data only for months that were successfully calculated
    historical_data_points = sorted(all_usage_data.values(), key=lambda x: x['index'])
    historical_months = [data['index'] for data in historical_data_points]
    
    # Store results for prediction
    may_predictions = {}
    
    for ingredient in KEY_INGREDIENTS:
        # Extract historical usage values for the current ingredient
        historical_usage = [data['usage'][ingredient] for data in historical_data_points]
        
        if len(historical_months) < 2:
            print(f"Not enough data points (need at least 2) to predict {ingredient}. Skipping prediction.")
            may_predictions[ingredient] = 0 # Default to 0 if not enough data
            continue

        # Perform Linear Regression: y = m*x + b
        # x is the month index, y is the total usage
        slope, intercept, r_value, p_value, std_err = linregress(historical_months, historical_usage)
        
        # Predict May usage (where x = 0)
        # Predicted Usage (y_pred) = slope * 0 + intercept
        predicted_usage = intercept
        
        # Ensure prediction is non-negative
        may_predictions[ingredient] = max(0, predicted_usage)
    
    return may_predictions

def plot_usage(all_usage_data, may_predictions):
    """Plots the historical and predicted ingredient usage using custom colors and dark background."""
    
    # Define all months in calendar order for plotting, including October
    calendar_months = ['May', 'June', 'July', 'August', 'September', 'October']
    
    # Create figure and axes
    fig, ax = plt.subplots(figsize=(14, 9)) 
    
    # --- UPDATE: Set custom dark background colors ---
    # Set the overall figure and the plot area background to the requested color
    fig.patch.set_facecolor(DASHBOARD_BG_COLOR)
    ax.set_facecolor(DASHBOARD_BG_COLOR)
    
    # Set text color for high contrast
    plt.rcParams['text.color'] = TEXT_COLOR
    ax.tick_params(axis='x', colors=TEXT_COLOR)
    ax.tick_params(axis='y', colors=TEXT_COLOR)
    ax.spines['left'].set_color(TEXT_COLOR)
    ax.spines['bottom'].set_color(TEXT_COLOR)
    ax.spines['right'].set_color(DASHBOARD_BG_COLOR)
    ax.spines['top'].set_color(DASHBOARD_BG_COLOR)

    # Set up the colors from the defined map
    for ingredient in KEY_INGREDIENTS:
        
        # Determine the color for the current ingredient's trend line
        line_color = COLOR_MAP.get(ingredient, 'grey')

        # Prepare data for plotting the current ingredient
        
        # 1. Historical Data (only June, July, August, September are present)
        # Map month name to usage value
        historical_usages = {name: data['usage'][ingredient] for name, data in all_usage_data.items()}

        # 2. Predicted Data (May)
        predicted_may = may_predictions.get(ingredient, 0)
        
        # Create the full data series in calendar order (May, June, July, Aug, Sep, Oct)
        usage_data = []
        for month in calendar_months:
            if month == 'May':
                usage_data.append(predicted_may)
            elif month in historical_usages:
                usage_data.append(historical_usages[month])
            else:
                # Use NaN for months where usage could not be calculated (like October)
                usage_data.append(np.nan) 
        
        # Find the index of May for coloring (always 0)
        may_index = calendar_months.index('May')

        # Plot the usage as a line with markers using the custom color
        ax.plot(calendar_months, usage_data, marker='o', linestyle='-', label=f'{ingredient} Trend', color=line_color)
        
        # Highlight the predicted May point using the dedicated prediction color
        # Only label the May prediction point once (for the first ingredient) to avoid legend clutter
        may_label = f'May Prediction ({ingredient})' if ingredient == KEY_INGREDIENTS[0] else None 
        
        # Scatter the May prediction point in the PREDICTION_COLOR
        ax.scatter(calendar_months[may_index], usage_data[may_index], 
                    color=PREDICTION_COLOR, zorder=5, label=may_label)
        
        # Annotate the May prediction
        ax.annotate(
            f'Pred: {predicted_may:,.0f}', 
            (calendar_months[may_index], usage_data[may_index]),
            textcoords="offset points", 
            xytext=(-10,15), 
            ha='center', 
            fontsize=9,
            color=TEXT_COLOR # Annotation text is also white
        )
        
    ax.set_title('Ingredient Usage Trend and May Prediction (Custom Colors)', fontsize=16, color=TEXT_COLOR)
    ax.set_xlabel('Month', fontsize=14, color=TEXT_COLOR)
    ax.set_ylabel('Total Usage (Units/Grams/Count)', fontsize=14, color=TEXT_COLOR)
    
    # Format Y-axis to use full numbers for readability on potentially large scales
    ax.ticklabel_format(style='plain', axis='y')
    
    # Adjust grid color to look subtle against the new dark background
    ax.grid(True, linestyle='--', alpha=0.3, color='lightgray') 
    
    ax.legend(loc='upper left', fontsize=10, facecolor=DASHBOARD_BG_COLOR, edgecolor=TEXT_COLOR, labelcolor=TEXT_COLOR)
    fig.tight_layout()
    
    # Save the plot as a PNG file
    plt.savefig('ingredient_usage_prediction.png')
    
    plt.show()

# --- Main Execution ---
if __name__ == "__main__":
    # 1. Load Ingredient Mapping
    df_ingredients = load_data()
    if df_ingredients is None:
        exit()

    # 2. Calculate Historical Usage (excluding aggregated data)
    historical_usage_data = calculate_monthly_usage(df_ingredients)

    # 3. Predict May Usage (using only calculated historical data)
    may_predictions = predict_may_usage(historical_usage_data)
    
    print("--- Predicted May Usage (Linear Trend, New Ingredients) ---")
    for ingredient, usage in may_predictions.items():
        print(f"Predicted May Usage for {ingredient}: {usage:,.2f}")
    
    # 4. Plot Results
    plot_usage(historical_usage_data, may_predictions)