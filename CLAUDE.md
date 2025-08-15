# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BenchEau is a modern web application that analyzes and compares French mineral waters based on comprehensive ANSES 2025 data. The application displays 79 mineral waters with 52 criteria each, including mineral composition, microplastics, PFAS, and usage recommendations.

## Development Commands

### Running the Application
```bash
# Local development server (recommended)
python3 -m http.server 8000
# or
npx http-server

# Open in browser
open http://localhost:8000
# or directly open the file
open index.html
```

### Testing Data Format
The application expects CSV data in French format with specific column names. Test data loading with:
```javascript
// In browser console
import { loadData } from './js/data.js';
loadData().then(result => console.log(result.rows));
```

## Architecture

### Core Structure
- **Single Page Application** with vanilla JavaScript ES6+ classes
- **Data-driven** interface with CSV parsing and real-time filtering
- **Glassmorphism UI** with responsive design and CSS animations
- **No build process** - direct file serving for development

### Key Components

#### BenchEauApp Class (`app.js`)
- Main application controller managing state and view switching
- Handles CSV parsing with custom logic for quoted fields
- Implements filtering, search, and comparison functionality
- Manages navigation between Dashboard, Compare, and Details views

#### Data Structure
The application expects CSV with French headers including:
- `Nom` - Water name
- `Type_eau` - Water type (Eau minérale naturelle/Eau de source)
- `Categorie_mineralisation` - Mineralization category
- `pH`, `Conductivite_µS_cm`, `Residu_sec_180C_mg_L` - Physical parameters
- `Calcium_mg_L`, `Magnesium_mg_L`, etc. - Mineral content
- `Conformite_ANSES_2025` - ANSES compliance status
- PFAS, microplastics, and environmental impact data

#### CSS Architecture (`style.css`)
- CSS custom properties for theming
- Glassmorphism effects with backdrop-filter
- Responsive grid layouts
- Animation system with CSS transitions

## Data Integration

### CSV Requirements
- French column headers with underscores and units (e.g., `Calcium_mg_L`)
- UTF-8 encoding with BOM support
- Quoted fields handling for comma-separated values
- File must be named `73780c22.csv` in root directory

### Adding New Data Points
1. Update CSV with new columns following French naming convention
2. Modify `parseCSV()` method if new field types are needed
3. Add display logic in render methods (e.g., `renderWaterCompareDetails()`)
4. Update filtering logic if new categories are added

## Key Features Implementation

### Scoring System
Waters are categorized by quality indicators based on:
- ANSES 2025 conformity status
- pH levels, mineral content
- Contamination levels (PFAS, microplastics)

### View System
Three main views managed by `switchView()`:
- **Dashboard**: Overview with stats, filters, and water grid
- **Compare**: Side-by-side comparison of two selected waters
- **Details**: Comprehensive analysis of single water

### Filtering Architecture
Real-time filtering with multiple criteria:
- Type (mineral vs source water)
- Mineralization level
- Carbonated status
- Text search across name and origin

## Performance Considerations

- **Lazy rendering**: Water cards generated on-demand
- **Event delegation**: Efficient DOM event handling
- **Debounced search**: 200ms delay on input filtering
- **Client-side processing**: All filtering/sorting done in memory

## Browser Compatibility

Requires modern browser features:
- ES6+ classes and modules
- CSS backdrop-filter for glassmorphism effects
- Fetch API for CSV loading
- CSS Grid and Flexbox

## Troubleshooting

### Data Loading Issues
- Verify `73780c22.csv` exists in root directory
- Check browser console for parsing errors
- Ensure CSV encoding is UTF-8

### Performance Issues  
- Reduce dataset size if rendering is slow
- Check for console errors in filtering logic
- Verify CSV structure matches expected headers

### UI Issues
- Clear browser cache with Ctrl+F5
- Check CSS custom property support
- Verify glassmorphism backdrop-filter support