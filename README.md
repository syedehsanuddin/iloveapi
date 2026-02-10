# API Feature Analyzer

A modern, minimal web application that analyzes API JSON or Swagger/OpenAPI JSON files and displays:
- Total number of endpoints
- Total number of categories
- Number of endpoints per category

## Features

- 🚀 Supports OpenAPI 3.x and Swagger 2.0 formats
- 📁 Upload JSON files or paste directly
- 🎨 Modern, minimal UI with dark theme
- ⚡ Fast and lightweight
- 📊 Beautiful statistics visualization

## Getting Started

### Installation

```bash
npm install
```

### Development

**Option 1: Run frontend only (without traffic tracking)**
```bash
npm run dev
```

**Option 2: Run both frontend and tracking server**
```bash
npm run dev:all
```

**Option 3: Run tracking server separately**
```bash
npm run server
```

The application will be available at `http://localhost:5173`
The tracking server runs on `http://localhost:3001`

### Traffic Monitoring

The app includes a traffic monitoring feature that logs visitor information to a text file (`traffic_log.txt`). Each visit is logged with:
- Timestamp
- IP Address
- Country and Country Code
- City and Region
- Timezone
- Page visited
- User Agent

**To enable traffic tracking:**
1. Start the tracking server: `npm run server` (or use `npm run dev:all` to run both)
2. The log file `traffic_log.txt` will be created automatically in the project root
3. All visitor traffic will be logged automatically when users visit your app

**Note:** The tracking server uses a free geolocation API (ip-api.com) with a rate limit of 45 requests per minute. For production use, consider using a paid service or self-hosted solution.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Paste your API JSON or Swagger JSON into the text area, or
2. Click "Upload JSON" to select a JSON file
3. Click "Analyze API" to see the results
4. View the statistics and category breakdown

## Supported Formats

- OpenAPI 3.x
- Swagger 2.0
- Generic API JSON structures

## Technologies

- React 18
- Vite
- Modern CSS with CSS Variables

# iloveapi
