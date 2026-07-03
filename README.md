# GenomeRisk AI: Genomic Disease Risk Predictor

GenomeRisk AI is a machine learning-powered health platform that analyzes raw genomic sequence data (.vcf) to predict predispositions for key health traits. By extracting genomic variants, the pipeline maps alternate allele dosages (0/1/2 encoding) relative to reference genome assembly version GRCh38 onto trained XGBoost classifiers.

The platform provides a modern clinical dashboard with advanced Explainable AI (XAI) feature attribution maps (SHAP values and DeepLIFT attribution scores) and live NCBI dbSNP integrations.

---

## 🚀 Key Features

*   **Genomic Ingestion Engine:** Parses raw standard Variant Call Format (VCF) files, matching and filtering coordinates.
*   **Predictive ML Classifiers:** Employs trained disease-specific XGBoost models for:
    *   🩸 **Type-2 Diabetes**
    *   ❤️ **Cardiovascular Health**
    *   🦳 **Male Pattern Baldness** (with gender-aware criteria)
    *   🧠 **Alzheimer's Disease Risk**
*   **Explainable AI (XAI):** Features a "Detailed Analytics Inspector" detailing:
    *   **Top 50 SHAP Loci:** Real-time impact weights (risk-increasing vs. protective).
    *   **DeepLIFT Attribution Mapping:** Local nucleotide sequence attribution.
*   **NCBI dbSNP Inspector:** Real-time queries to NCBI EntreZ APIs to fetch clinical significance, gene associations, and Global Minor Allele Frequencies (MAF).
*   **Printable Reports:** Professional CSS styling for downloading or printing clean clinical results.
*   **Demo Presentation Gallery:** Pre-packaged reference profiles to run instantly.

---

## 📂 Project Structure

```text
├── backend/
│   ├── data/
│   │   ├── demo_vcf/         # Demo genomic files
│   │   └── models/           # XGBoost JSON models & feature names lists
│   ├── inference1.py         # Primary VCF parsing, inference, & SHAP weight engine
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.txt      # Python backend packages
│   └── config.json           # Server configuration
│
├── genomrisk-frontend/
│   └── genomrisk/
│       ├── src/              # React components & pages
│       ├── package.json      # React dependencies & scripts
│       └── vite.config.js    # Vite configuration
│
└── README.md                 # Project documentation
```

---

## ⚙️ Running Locally

### 1. Backend Server Setup
Navigate to the `backend` folder, set up a virtual environment, install requirements, and start the FastAPI server:

```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python -m backend.main
```
The server will boot on `http://127.0.0.1:8000`.

### 2. Frontend React Web App Setup
Navigate to the frontend React project, install dependencies, and launch Vite:

```bash
cd genomrisk-frontend/genomrisk
npm install
npm run dev
```
The app will run locally on `http://localhost:5173`.

---

## 🛠️ Built With

*   **Backend:** Python, FastAPI, XGBoost, Pandas, Numpy, Uvicorn
*   **Frontend:** React, Vite, Vanilla CSS
*   **APIs:** NCBI E-utilities (dbSNP)
