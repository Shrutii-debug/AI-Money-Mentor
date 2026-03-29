import os
import json
import time
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from cams_parser import parse_cams_pdf, get_demo_portfolio
from agents import run_xray_agent, run_fire_agent, run_health_score_agent

app = FastAPI(title="AI Money Mentor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": time.time()}


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(None),
    age: int = Form(32),
    monthly_income: int = Form(120000),
    monthly_expense: int = Form(65000),
    use_demo: bool = Form(False),
):
    audit_log = []

    # Step 1: Parse portfolio
    audit_log.append({"step": "parse", "status": "started", "ts": time.time()})
    if use_demo or file is None:
        portfolio = get_demo_portfolio()
        audit_log.append({"step": "parse", "status": "demo_data_loaded", "ts": time.time()})
    else:
        file_bytes = await file.read()
        portfolio = parse_cams_pdf(file_bytes)
        audit_log.append({"step": "parse", "status": f"parsed_{portfolio['parsed_from']}", "ts": time.time()})

    # Inject user inputs
    portfolio["investor"]["age"] = age
    portfolio["investor"]["monthly_income"] = monthly_income
    portfolio["investor"]["monthly_expense"] = monthly_expense

    # Step 2: X-ray Agent
    audit_log.append({"step": "xray_agent", "status": "started", "ts": time.time()})
    try:
        xray = run_xray_agent(portfolio)
        audit_log.append({"step": "xray_agent", "status": "completed", "ts": time.time()})
    except Exception as e:
        audit_log.append({"step": "xray_agent", "status": f"error: {str(e)}", "ts": time.time()})
        return JSONResponse(status_code=500, content={"error": str(e), "audit_log": audit_log})

    # Step 3: FIRE Agent
    audit_log.append({"step": "fire_agent", "status": "started", "ts": time.time()})
    try:
        fire = run_fire_agent(portfolio, xray)
        audit_log.append({"step": "fire_agent", "status": "completed", "ts": time.time()})
    except Exception as e:
        audit_log.append({"step": "fire_agent", "status": f"error: {str(e)}", "ts": time.time()})
        fire = {}

    # Step 4: Health Score Agent
    audit_log.append({"step": "health_agent", "status": "started", "ts": time.time()})
    try:
        health = run_health_score_agent(portfolio, xray, fire)
        audit_log.append({"step": "health_agent", "status": "completed", "ts": time.time()})
    except Exception as e:
        audit_log.append({"step": "health_agent", "status": f"error: {str(e)}", "ts": time.time()})
        health = {}

    return {
        "investor": portfolio["investor"],
        "data_source": portfolio["parsed_from"],
        "xray": xray,
        "fire": fire,
        "health": health,
        "audit_log": audit_log,
        "disclaimer": "This is an AI-generated analysis for educational purposes only. Not SEBI-registered financial advice.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)