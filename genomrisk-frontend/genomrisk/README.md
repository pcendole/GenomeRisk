# GenomeRisk Frontend

React + Vite clinical UI for genomic risk analysis.

## Features
- Login simulation for demo usage.
- Dashboard with latest analysis stats.
- VCF upload and multi-trait analysis trigger.
- Results page with per-trait risk and top loci.
- Searchable history table.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## API Configuration

The frontend reads backend base URL from `VITE_API_BASE_URL`.

Example `.env`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If not set, it defaults to `http://127.0.0.1:8000`.

## Project Structure

```text
src/
    api.js            # Shared API client utilities
    App.jsx           # Shell layout + page switching
    main.jsx          # App bootstrap
    pages/
        Login.jsx
        Dashboard.jsx
        Upload.jsx
        Results.jsx
        History.jsx
```
