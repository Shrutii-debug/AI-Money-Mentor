# 💰 AI Money Mentor
### ET AI Hackathon 2026 · Problem Statement PS9
**Multi-Agent Portfolio Intelligence System for Indian Investors**



🌐 **Live Demo:** https://moneymentori.netlify.app

![Python](https://img.shields.io/badge/Python-3.11+-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688) ![Grok](https://img.shields.io/badge/LLM-Grok_3_Mini-FF6B00)

---

## 🎯 What Is This?

AI Money Mentor is a **multi-agent AI system** that analyses an Indian investor's mutual fund portfolio and produces three outputs automatically — Portfolio X-Ray, FIRE Planner, and Money Health Score — with zero manual effort.

Upload your CAMS statement (or click **Try Demo**) and get actionable insights in under 30 seconds.

---

## 🤖 The 3 AI Agents

### Agent 1 — Portfolio X-Ray 🔬
- Computes true **XIRR** for each fund (not misleading absolute return)
- Detects **fund overlap** — flags funds in same category paying 2x expense ratios
- Calculates **20-year expense drag** in rupees
- Identifies underperforming funds vs Nifty 50 benchmark (13.8% XIRR)

### Agent 2 — FIRE Planner 🔥
- Computes your **FIRE number** (25x annual expenses)
- Projects corpus **year-by-year** at 12% growth rate
- Shows **SIP needed** to retire at age 55
- Visualises the timeline chart with FIRE crossover point

### Agent 3 — Money Health Score 💯
- **6-axis scorecard**: Return Quality, Diversification, Cost Efficiency, Tax Efficiency, Savings Rate, FIRE Progress
- Overall **score out of 100** with letter grade A–F
- Priority action list ranked by impact

---

## 🛠️ Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Agent Framework | Custom Python agents | Clean orchestrator → specialist routing |
| LLM | Grok API (grok-3-mini) | Free tier, fast, financial reasoning |
| PDF Parsing | pdfplumber | CAMS PDFs are text-based |
| XIRR Calc | Custom Newton-Raphson | Handles irregular SIP cashflows correctly |
| NAV Data | mfapi.in (free REST API) | All Indian MFs, historical NAV |
| Backend | FastAPI + Uvicorn | Fast Python API server |
| Frontend | React + Vite | Clean dashboard UI |
| Charts | Recharts | XIRR bar, FIRE timeline, Radar chart |

---

## 📁 Project Structure
```
ai-money-mentor/
├── backend/
│   ├── main.py          ← FastAPI server, orchestrates 3 agents
│   ├── agents.py        ← X-Ray, FIRE, Health Score agent logic
│   ├── cams_parser.py   ← PDF parser + demo portfolio
│   ├── xirr_calc.py     ← XIRR computation (Newton-Raphson)
│   ├── requirements.txt
│   └── .env             ← GROK_API_KEY goes here (never commit this)
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── Upload.jsx
    │       ├── XrayReport.jsx
    │       ├── FirePlanner.jsx
    │       └── HealthScore.jsx
    └── package.json
```

---

## 🚀 How To Run

### Prerequisites
- Python 3.11+ → [python.org](https://python.org/downloads)
- Node.js LTS → [nodejs.org](https://nodejs.org)
- Grok API key (free) → [console.x.ai](https://console.x.ai)

### Step 1 — Clone the repo
```bash
git clone https://github.com/Shrutii-debug/ai-money-mentor.git
cd ai-money-mentor
```

### Step 2 — Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
✅ You should see: `INFO: Uvicorn running on http://0.0.0.0:8000`

### Step 3 — Frontend (open a new terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ Open **http://localhost:3000** in your browser

### Step 4 — Environment Setup
Create `backend/.env`:
```
GROK_API_KEY=your_grok_key_here
```

---

## 📊 Hackathon Rubric Scorecard

| Dimension | Weight | How We Address It |
|---|---|---|
| Autonomy Depth | 30% | PDF → parse → XIRR → overlap → FIRE → health score → report. Zero human steps. Orchestrator retries on failure. |
| Multi-Agent Design | 20% | 3 specialists with clean boundaries. X-Ray feeds corpus to FIRE. FIRE feeds to Health Score. No shared state. |
| Technical Creativity | 20% | Real XIRR (not CAGR). Fund overlap detection. 20-year cost drag in ₹. Grok mini = cost efficiency bonus. |
| Enterprise Readiness | 20% | Full audit log per request. SEBI disclaimer. Graceful fallback to demo data if PDF parse fails. |
| Impact Quantification | 10% | ₹ drag per fund. FIRE gap in rupees. Before/after SIP comparison. Real numbers not vanity metrics. |

---

## 🎬 Demo Script (3 minutes)

1. Open the app → click **Try Demo**
2. **X-Ray tab** → Point out HDFC Top 100 Regular Plan (1.67% expense ratio = ₹1.2L drag over 20 years). 3 Large Cap funds with 62% overlap.
3. **FIRE tab** → Current corpus + ₹18,000/month SIP → retire at age 52. Show corpus crossover on the chart.
4. **Health Score tab** → 61/100 grade C. Radar chart shows Cost Efficiency and Tax Efficiency as weakest axes.
5. Close with: *"14 crore demat account holders in India. This tool surfaces the exact rupee cost of bad fund choices in under 30 seconds."*

---

## 🧪 Test Scenarios

| Scenario | How to Trigger | What Happens |
|---|---|---|
| All Large Cap | Set all 6 funds to Large Cap | 15 overlap pairs flagged |
| Negative Alpha | All XIRRs below 13.8% | Full red X-Ray, urgent advice |
| Zero Savings | Income = Expense | FIRE age shows 80+, score crashes |
| All Regular Plans | All funds say Regular Growth | Tax Efficiency = 0 |
| Bad PDF Upload | Upload non-CAMS PDF | Graceful fallback, no crash |
| Perfect Portfolio | Index fund only, age 25 | Score 85+, FIRE at 45 |

---

## ⚠️ Disclaimer

This is an AI-generated analysis tool built for the ET AI Hackathon 2026. **Not SEBI-registered financial advice.** For educational purposes only.

---

## 🙏 Built With

- [FastAPI](https://fastapi.tiangolo.com) — Backend framework
- [React](https://react.dev) — Frontend
- [Grok API by xAI](https://console.x.ai) — LLM
- [mfapi.in](https://mfapi.in) — Free Indian MF NAV data
- [Recharts](https://recharts.org) — Charts

---

*Built with ❤️ for ET AI Hackathon 2026*
```

---
