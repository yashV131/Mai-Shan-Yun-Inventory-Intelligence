

---

# Inventory Intelligence Dashboard

*Part of the Mai‑Shan‑Yun Inventory Intelligence Project*

## Table of Contents

1. [Project Overview](#project‑overview)
2. [Motivation](#motivation)
3. [Features](#features)
4. [Architecture & Tech Stack](#architecture‑tech‑stack)
5. [Getting Started](#getting‑started)

   * Prerequisites
   * Installation
   * Configuration
   * Running the Dashboard
6. [Data Sources & Integration](#data‑sources‑integration)
7. [Usage Guide](#usage‑guide)

   * Key Views / Tabs
   * Typical Workflows
8. [Customization & Extensibility](#customization‑extensibility)
9. [Deployment](#deployment)
10. [Testing](#testing)
11. [Known Issues & Limitations](#known‑issues‑limitations)
12. [Contributing](#contributing)
13. [License](#license)
14. [Acknowledgements](#acknowledgements)

---

## Project Overview

This dashboard provides an interactive interface for visualizing, analysing and acting on inventory and purchasing data for the restaurant Mai Shan Yun. It pulls together datasets including purchase logs, shipments, menu sales trends and ingredient usage into a consolidated view, and supports insights such as:

* What ingredients are being over‑stocked or under‑stocked?
* Which menu items are driving ingredient usage spikes?
* Predictive signals: when should we restock certain items to avoid shortages or reduce waste?
* Visualised dashboards to support inventory managers, operations teams and finance stakeholders.

---

## Motivation

Managing a restaurant food supply chain is complex: ingredients arrive from shipments, are used in menu items, vary in demand, and inventories must be cost‑managed. This project aims to turn raw logs and disparate data sources into **actionable intelligence**. By providing visual insights and forecasting signals, the dashboard aims to analyze what's popular in specific months, reduce waste, avoid over‑ordering, and ensure the right ingredients are available at the right time.

---

## Features

* Dashboard overview with high‑level KPIs: inventory value, turnover, waste, shortage risk
* Time‑series visualisations of ingredient usage, purchase orders, shipments
* Menu‑item analytics: mapping which items consume which ingredients, trending performance
* Forecasting / alerting: identify items about to run low, highlight over‑stock risk
* Drill‑down capability: by ingredient, by supplier, by menu item, by time period
* Exportable views / reports for operational review
* Modular, extensible architecture (so new data sources or visualisations can be added)

---

## Architecture & Tech Stack

**Frontend / UI**

* Built with a dashboarding framework through React with TypeScript
* Responsive layout, interactive filters, AI overviews

**Backend / Data Processing**

* Data ingestion from multiple sources: purchase logs, ingredient usage, shipments, menu sales
* Data cleaning and transformation using python scripts
* Forecasting using python scripts and Gemini AI

**Data Sources**

* CSVs and API feeds
* Ingredient master list, menu‑item mapping, supply-item information

**Deployment / Environment**

* Python environment (version 3.14.0)
* Dependencies listed in `requirements.txt`
* Runs locally and is deployed on goDaddy

---

## Getting Started

### Prerequisites

* Python 3.14.0
* Virtual environment tool (venv)
* Access to the data sources (purchase logs, menu sales, shipments)
* API keys (Gemini AI)

### Installation

```bash
# Clone the repository (or this sub‑folder)  
git clone https://github.com/yashV131/Mai‑Shan‑Yun‑Inventory‑Intelligence.git  
cd Mai‑Shan‑Yun‑Inventory‑Intelligence/inventory‑intelligence‑dashboard  

# Create and activate virtual environment  
python3 -m venv venv  
source venv/bin/activate    # on Linux/macOS  
# or venv\Scripts\activate   # on Windows  

# Install dependencies  
pip install -r requirements.txt  
```

### Configuration

* Copy the example config file (if present) `config.example.yml` → `config.yml`
* Edit the config to point to your data files / database / credentials

  * e.g., `data/purchases.csv`, `data/shipments.csv`, `data/menu_sales.csv`
  * Set any relevant parameters: forecasting horizon, alert thresholds, currency, etc

### Running the Dashboard

```bash
# Activate environment (if not already)  
source venv/bin/activate  

# Run the dashboard  
python app.py           # or `streamlit run app.py` if using Streamlit  
```

* Once started you’ll see a local web server (e.g., [http://localhost:8501](http://localhost:8501))
* Open in browser and explore the visualisations, filters, drill‑downs

---

## Data Sources & Integration

This dashboard integrates multiple datasets, including (but not limited to):

| Dataset                | Description                                                                         | Key Attributes                                         |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Monthly Purchase Logs  | Records of every purchase order placed (ingredient, quantity, cost, date, supplier) | ingredient_id, qty, cost, date, supplier               |
| Ingredient Usage Logs  | Usage of ingredients as consumed in menu items or converted by kitchen              | ingredient_id, menu_item_id, qty_used, date            |
| Shipments              | Inbound shipments: date, supplier, tracking, arrival, quantity, SKU                 | shipment_id, ingredient_id, qty_received, arrival_date |
| Menu Item Sales Trends | Sales logs of menu items (which drive ingredient usage)                             | menu_item_id, sales_qty, date                          |
| Master Lists / Mapping | Ingredient master list (IDs, names, units), Menu‑Item → Ingredient mapping          | ingredient_id, menu_item_id, unit, cost_per_unit       |

Integration steps typically include: load all datasets → clean/standardise dates & units → join via ingredient_id / menu_item_id → aggregate and compute key metrics (e.g., avg. consumption per menu item, reorder lead time, inventory turnover).

---

## Usage Guide

### Key Views / Tabs

* **Dashboard Overview**: ----
* **Ingredient Usage & Trend**: line charts showing usage over time, top‑consumed ingredients
* **Purchase & Shipment Flow**: visualisation of when orders placed vs when received vs when used
* **Menu Item Impact**: which menu items consume the most/least ingredients, trending items
* **Forecast / Alerts**: predicted exhaustion dates, reorder suggestions, over‑stock warnings
* **Drill‑down & Filters**: filter by supplier, ingredient category, date range, menu item

### Typical Workflows

1. **Inventory Health Check**: Open the overview to see current inventory value and identify any ingredients flagged for risk.
2. **Investigate Usage Trend**: Spot an ingredient whose usage is rising fast → open the ingredient trend tab → filter by that ingredient → observe usage per menu item.
3. **Supplier/Order Lag Analysis**: Use the purchase vs shipment view to identify longer lead‑times or delays from a particular supplier.
4. **Forecast Reorder**: Go to forecast tab → set horizon (e.g., next 30/60 days) → see recommended reorder items and quantities.
5. **Report Export**: Export the current view or snapshot for operations/finance review.

---

## Customization & Extensibility

The architecture is designed to be modular: you can extend or customise the dashboard by:

* Adding new data sources (e.g., spoilage logs, supplier rating data)
* Adding new visual components (e.g., heat maps, geographic maps of supplier shipments)
* Tuning alert or forecast logic (e.g., different reorder thresholds, seasonal adjustments)
* Changing the front‑end look and feel (theme, layout)
* Integrating with other systems (e.g., Slack/email alerts when inventory risk is flagged)

Developers can locate key parts of the code in modules like `/data_processing/`, `/visualisations/`, `/alerts/`. Be sure to update the config and dependencies accordingly.

---

## Deployment

To deploy for production:

* Choose a hosting environment (cloud VM, containerised service, serverless)
* Provision required dependencies (Python runtime, web server, firewall/open‑port)
* Configure environment variables / credentials securely
* Set up scheduling if needed (e.g., nightly data refresh, alert emails)
* Monitor performance and user access
* (Optional) Secure the dashboard with authentication if exposing externally

---

## Testing

* Unit tests exist (if included) under `/tests/`. Run via `pytest` or equivalent.
* Check edge cases: missing data, zero usage, extremely high usage, negative values.
* Validate forecasts and alert logic by back‑testing with historical data.
* Ensure UI layout works across browsers/devices.
* Validate that data ingestion handles changes in schema (e.g., new columns) gracefully.

---

## Known Issues & Limitations

* The forecasting logic may assume linear/trend‑based behaviour; seasonal or external effects may not be captured.
* Real‑time data ingestion may not be supported (depends on batch‑update design).
* Some units/ingredients may require manual mapping or cleaning (unit conversions, synonyms).
* If large volumes of data are ingested, performance may degrade (consider data sampling, indexing or caching).
* Only one locale/currency/time‑zone may be supported by default (customise if needed).

---

## Contributing

We welcome contributions! If you’d like to propose a new feature, fix a bug, or enhance the dashboard:

1. Fork the repository
2. Create a new branch (`feature/your‑feature`, `fix/bug‑description`)
3. Write tests where appropriate
4. Submit a pull request with a clear description of your change
5. Ensure code style and documentation are updated

Please review the `CONTRIBUTING.md` (if present) for more details.

---

## License

This project is licensed under the [specify license here, e.g., MIT License] — see `LICENSE` file for details.

---

## Acknowledgements

* Thanks to the team at [Mai Shan Yun Restaurant] for providing the challenge dataset and context.
* The initiative is part of the TAMU Datathon 25 “Inventory Intelligence” challenge. ([TAMU Datathon 25: A Code Case!][1])
* Any libraries/frameworks used (e.g., Streamlit, Dash, Pandas, Plotly)
* Contributors and maintainers of this sub‑project

---

If you like, I can **generate** a ready‑to‑use markdown `README.md` file including badges (build/test coverage), sample screenshots, and links. Would you like me to do that?

[1]: https://td25.devpost.com/?utm_source=chatgpt.com "TAMU Datathon 25: A Code Case!: TAMU Datathons Premiere ..."
