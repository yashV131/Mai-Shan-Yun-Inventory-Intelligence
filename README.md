

---

# Inventory Intelligence Dashboard

*Part of the Mai‑Shan‑Yun Inventory Intelligence Project*

## Table of Contents

1. [Project Overview](#project‑overview)
2. [Motivation](#motivation)
3. [Features](#features)
4. [Architecture & Tech Stack](#architecture‑tech‑stack)
5. [Data Sources & Integration](#data‑sources‑integration)
6. [Usage Guide](#usage‑guide)

   * Key Views / Tabs
7. [Known Issues & Limitations](#known‑issues‑limitations)
8. [Acknowledgements](#acknowledgements)

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

### Dashboard Overview

The **Inventory Intelligence Dashboard** provides a consolidated view of inventory, ingredient usage, and sales performance for Mai Shan Yun. Key components include:

1.  **Ingredient Usage – Monthly View**
    *   Bar chart showing top ingredients consumed for the selected month.
    *   Allows managers to quickly identify overused or underused items.
        
2.  **Monthly Sales Overview**
    *   Visualizes sales by menu group, category, or item.
    *   Helps correlate ingredient consumption with menu performance.
        
3.  **AI Ingredient Forecast**
    *   Predicts ingredient needs for upcoming months using historical sales and Gemini AI.
    *   Users can generate forecasts with one click to plan procurement.
        
4.  **Inventory Hub – Stock vs Usage**
    *   Compares purchased vs used quantities for each ingredient.
    *   Quickly identifies overstocked or understocked items.
        
5.  **AI Inventory Analysis**
    *   Provides actionable suggestions on adjusting shipments based on current stock levels.
    *   Supports operational decisions to reduce shortages or excess inventory.
        
6.  **Reorder Forecast Table**
    *   Summarizes purchased quantities, consumption, stock left, and current status (e.g., understocked).
    *   Highlights critical items requiring immediate action.

---

## Known Issues & Limitations

* The forecasting logic may assume linear/trend‑based behaviour; seasonal or external effects may not be captured.
* Real‑time data ingestion may not be supported (depends on batch‑update design).
* Some units/ingredients may require manual mapping or cleaning (unit conversions, synonyms).
* If large volumes of data are ingested, performance may degrade (consider data sampling, indexing or caching).
* Only one locale/currency/time‑zone may be supported by default (customise if needed).

---

## Acknowledgements

* Thanks to the team at [Mai Shan Yun Restaurant] for providing the challenge dataset and context.
* The initiative is part of the TAMU Datathon 25 “Inventory Intelligence” challenge.
* Reacact, Python, Gemini API, Pandas, Plotly)

---
