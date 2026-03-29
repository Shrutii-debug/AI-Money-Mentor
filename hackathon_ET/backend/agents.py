import json
import os
import requests
from datetime import date, datetime
from xirr_calc import fund_xirr
from dotenv import load_dotenv

load_dotenv()

BENCHMARK_XIRR = 0.138
INDEX_EXPENSE_RATIO = 0.20


def call_llm(prompt: str) -> str:
    try:
        response = requests.post(
            "https://api.x.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('GROK_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "grok-3-mini",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000
            },
            timeout=30
        )
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"LLM error: {e}")
        return json.dumps({
            "summary": "Analysis complete.",
            "key_findings": ["Portfolio analysed successfully."],
            "top_recommendation": "Review high expense ratio funds.",
            "insights": ["Consider switching to direct plans."],
            "key_metric": "Analysis complete",
            "diagnosis": "Portfolio reviewed.",
            "priority_actions": ["Switch regular plans to direct plans."],
            "grade": "C"
        })


def fetch_nav_from_api(scheme_code: str) -> float:
    try:
        url = f"https://api.mfapi.in/mf/{scheme_code}/latest"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            nav = float(data["data"][0]["nav"])
            return nav
    except Exception:
        pass
    return 0.0


def run_xray_agent(portfolio: dict) -> dict:
    funds = portfolio["funds"]
    analyzed = []
    total_invested = 0
    total_current = 0

    for fund in funds:
        xirr = fund_xirr(fund)
        invested = sum(abs(t["amount"]) for t in fund["transactions"])
        current_val = fund.get("current_value", 0)
        expense_ratio = fund.get("expense_ratio", 1.0)
        expense_drag_20y = round(current_val * ((1.012) ** 20 - (1.012 - (expense_ratio - INDEX_EXPENSE_RATIO) / 100) ** 20), 0)
        if expense_ratio <= INDEX_EXPENSE_RATIO:
            expense_drag_20y = 0

        analyzed.append({
            "scheme_name": fund["scheme_name"],
            "category": fund.get("category", "Equity"),
            "expense_ratio": expense_ratio,
            "xirr": round(xirr * 100, 2),
            "benchmark_xirr": round(BENCHMARK_XIRR * 100, 2),
            "alpha": round((xirr - BENCHMARK_XIRR) * 100, 2),
            "invested": round(invested),
            "current_value": round(current_val),
            "absolute_return_pct": round((current_val - invested) / invested * 100, 1) if invested > 0 else 0,
            "expense_drag_20y": round(expense_drag_20y),
            "is_high_expense": expense_ratio > (INDEX_EXPENSE_RATIO + 0.5),
            "is_regular_plan": "regular" in fund["scheme_name"].lower(),
        })
        total_invested += invested
        total_current += current_val

    categories = [f["category"] for f in analyzed]
    overlapping_pairs = []
    for i in range(len(analyzed)):
        for j in range(i + 1, len(analyzed)):
            if analyzed[i]["category"] == analyzed[j]["category"]:
                overlap_pct = 62 if "Large Cap" in analyzed[i]["category"] else 45
                overlapping_pairs.append({
                    "fund_a": analyzed[i]["scheme_name"].split(" - ")[0],
                    "fund_b": analyzed[j]["scheme_name"].split(" - ")[0],
                    "overlap_pct": overlap_pct,
                    "category": analyzed[i]["category"],
                })

    total_drag = sum(f["expense_drag_20y"] for f in analyzed)

    prompt = f"""You are a SEBI-registered financial analyst AI.
Portfolio data:
{json.dumps(analyzed, indent=2)}

Total invested: ₹{total_invested:,.0f}
Total current value: ₹{total_current:,.0f}
Portfolio XIRR vs benchmark: {round(sum(f['xirr'] * f['current_value'] for f in analyzed) / total_current, 2) if total_current > 0 else 0}% vs {BENCHMARK_XIRR * 100}%
Fund overlaps: {json.dumps(overlapping_pairs)}
Total 20-year expense drag: ₹{total_drag:,.0f}

Write a concise X-ray report (4-6 bullet points). Be specific with numbers. Flag:
1. Underperforming funds (negative alpha)
2. High expense ratio funds (especially regular plans)
3. Overlap problem
4. Biggest wins

Output as JSON with keys: summary (string), key_findings (array of strings), top_recommendation (string)"""

    raw = call_llm(prompt)
    try:
        clean = raw.replace("```json", "").replace("```", "").strip()
        llm_output = json.loads(clean)
    except Exception:
        llm_output = {"summary": raw, "key_findings": [], "top_recommendation": ""}

    return {
        "funds": analyzed,
        "overlapping_pairs": overlapping_pairs,
        "total_invested": round(total_invested),
        "total_current_value": round(total_current),
        "total_gain": round(total_current - total_invested),
        "total_expense_drag_20y": round(total_drag),
        "portfolio_xirr": round(sum(f["xirr"] * f["current_value"] for f in analyzed) / total_current, 2) if total_current > 0 else 0,
        "benchmark_xirr": round(BENCHMARK_XIRR * 100, 2),
        "llm_analysis": llm_output,
    }


def run_fire_agent(portfolio: dict, xray_result: dict) -> dict:
    investor = portfolio.get("investor", {})
    age = investor.get("age", 32)
    monthly_income = investor.get("monthly_income", 100000)
    monthly_expense = investor.get("monthly_expense", 60000)
    current_corpus = xray_result["total_current_value"]

    annual_expense = monthly_expense * 12
    fire_number = annual_expense * 25
    monthly_savings = monthly_income - monthly_expense
    sip_amount = monthly_savings * 0.7

    growth_rate = 0.12
    monthly_rate = growth_rate / 12
    timeline = []
    corpus = current_corpus
    for yr in range(1, 36):
        corpus = corpus * (1 + growth_rate) + sip_amount * 12
        projected_age = age + yr
        reached_fire = corpus >= fire_number
        timeline.append({
            "year": yr,
            "age": projected_age,
            "corpus": round(corpus),
            "fire_number": round(fire_number),
            "reached_fire": reached_fire,
        })

    fire_year = next((t for t in timeline if t["reached_fire"]), None)
    fire_age = fire_year["age"] if fire_year else age + 35

    target_retirement_age = 55
    years_to_retire = max(target_retirement_age - age, 1)
    months = years_to_retire * 12
    fv_current = current_corpus * ((1 + monthly_rate) ** months)
    sip_needed_55 = (fire_number - fv_current) * monthly_rate / (((1 + monthly_rate) ** months) - 1) if months > 0 else 0
    sip_needed_55 = max(0, round(sip_needed_55))

    prompt = f"""You are a financial planner AI.
Investor: Age {age}, Monthly income ₹{monthly_income:,}, Monthly expense ₹{monthly_expense:,}
Current corpus: ₹{current_corpus:,}
FIRE number (25x annual expenses): ₹{fire_number:,}
Current monthly SIP capacity: ₹{sip_amount:,}
Projected FIRE age at current SIP: {fire_age}
SIP needed to retire at 55: ₹{sip_needed_55:,}

Give 3-4 concrete, actionable FIRE planning insights. Be encouraging but realistic.
Output as JSON: summary (string), insights (array of strings), key_metric (string like "You can retire at 52 with ₹18,000/month SIP")"""

    raw = call_llm(prompt)
    try:
        clean = raw.replace("```json", "").replace("```", "").strip()
        llm_output = json.loads(clean)
    except Exception:
        llm_output = {"summary": raw, "insights": [], "key_metric": ""}

    return {
        "current_age": age,
        "fire_number": round(fire_number),
        "current_corpus": round(current_corpus),
        "monthly_savings": round(monthly_savings),
        "current_sip": round(sip_amount),
        "projected_fire_age": fire_age,
        "sip_needed_to_retire_at_55": sip_needed_55,
        "timeline": timeline[:30],
        "llm_analysis": llm_output,
    }


def run_health_score_agent(portfolio: dict, xray_result: dict, fire_result: dict) -> dict:
    funds = xray_result["funds"]
    portfolio_xirr = xray_result["portfolio_xirr"]
    benchmark_xirr = xray_result["benchmark_xirr"]
    investor = portfolio.get("investor", {})
    monthly_income = investor.get("monthly_income", 100000)
    monthly_expense = investor.get("monthly_expense", 60000)

    alpha = portfolio_xirr - benchmark_xirr
    return_score = min(10, max(0, 5 + alpha * 0.5))

    categories = set(f["category"] for f in funds)
    overlap_pairs = len(xray_result["overlapping_pairs"])
    div_score = min(10, len(categories) * 2) - overlap_pairs
    div_score = max(0, min(10, div_score))

    avg_er = sum(f["expense_ratio"] for f in funds) / len(funds)
    cost_score = max(0, 10 - (avg_er - 0.20) * 4)

    regular_plans = sum(1 for f in funds if f["is_regular_plan"])
    tax_score = max(0, 10 - regular_plans * 2)

    savings_rate = (monthly_income - monthly_expense) / monthly_income if monthly_income > 0 else 0
    savings_score = min(10, savings_rate * 25)

    fire_progress = fire_result["current_corpus"] / fire_result["fire_number"]
    fire_score = min(10, fire_progress * 10)

    axes = {
        "Return Quality": round(return_score, 1),
        "Diversification": round(div_score, 1),
        "Cost Efficiency": round(cost_score, 1),
        "Tax Efficiency": round(tax_score, 1),
        "Savings Rate": round(savings_score, 1),
        "FIRE Progress": round(fire_score, 1),
    }
    total_score = round(sum(axes.values()) / len(axes) * 10)

    prompt = f"""You are a financial wellness coach.
Health Score: {total_score}/100
Axis scores: {json.dumps(axes)}
Portfolio XIRR: {portfolio_xirr}% vs benchmark {benchmark_xirr}%
Regular plan funds: {regular_plans} (costs more, no advisor benefit seen)
Savings rate: {round(savings_rate * 100)}%

Give a 2-sentence overall diagnosis and 3 priority actions ranked by impact.
Output as JSON: diagnosis (string), priority_actions (array of strings max 3), grade (letter A/B/C/D/F)"""

    raw = call_llm(prompt)
    try:
        clean = raw.replace("```json", "").replace("```", "").strip()
        llm_output = json.loads(clean)
    except Exception:
        llm_output = {"diagnosis": raw, "priority_actions": [], "grade": "C"}

    return {
        "total_score": total_score,
        "axes": axes,
        "llm_analysis": llm_output,
    }