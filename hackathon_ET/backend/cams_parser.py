import re
import io
from datetime import datetime, date
from typing import Optional

try:
    import pdfplumber
except ImportError:
    pdfplumber = None


def parse_date(s: str) -> Optional[date]:
    for fmt in ("%d-%b-%Y", "%d/%m/%Y", "%d-%m-%Y", "%B %d, %Y"):
        try:
            return datetime.strptime(s.strip(), fmt).date()
        except ValueError:
            continue
    return None


def parse_amount(s: str) -> float:
    s = re.sub(r"[₹,\s]", "", s)
    try:
        return float(s)
    except ValueError:
        return 0.0


def parse_cams_pdf(file_bytes: bytes) -> dict:
    try:
        if pdfplumber is None:
            return get_demo_portfolio()
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        if len(full_text.strip()) < 100:
            return get_demo_portfolio()
        result = _parse_text(full_text)
        if not result["funds"]:
            return get_demo_portfolio()
        return result
    except Exception as e:
        print(f"PDF parse error: {e}, using demo data")
        return get_demo_portfolio()


def _parse_text(text: str) -> dict:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    investor = {"name": "Investor", "pan": "XXXXX0000X", "email": ""}
    for line in lines:
        if "Name" in line and ":" in line:
            investor["name"] = line.split(":", 1)[-1].strip()
        if re.match(r"[A-Z]{5}\d{4}[A-Z]", line):
            investor["pan"] = line.strip()

    funds = []
    current_fund = None
    txn_pattern = re.compile(
        r"(\d{2}[-/]\w+[-/]\d{4})\s+([\w\s]+?)\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)"
    )

    for i, line in enumerate(lines):
        if re.search(r"(Fund|Scheme|Direct|Regular|Growth|Dividend)", line, re.I) and len(line) > 20:
            if current_fund and current_fund.get("transactions"):
                funds.append(current_fund)
            current_fund = {
                "scheme_name": line,
                "scheme_code": "",
                "folio": "",
                "expense_ratio": 1.0,
                "category": "Equity",
                "transactions": [],
                "current_value": 0.0,
                "current_units": 0.0,
            }

        if current_fund:
            m = txn_pattern.search(line)
            if m:
                d = parse_date(m.group(1))
                if d:
                    current_fund["transactions"].append({
                        "date": d.isoformat(),
                        "type": m.group(2).strip(),
                        "amount": -parse_amount(m.group(3)),
                        "units": parse_amount(m.group(4)),
                        "nav": parse_amount(m.group(5)),
                    })
            cv_match = re.search(r"Market Value[:\s]+([\d,]+\.\d+)", line, re.I)
            if cv_match:
                current_fund["current_value"] = parse_amount(cv_match.group(1))

    if current_fund and current_fund.get("transactions"):
        funds.append(current_fund)

    return {"investor": investor, "funds": funds, "parsed_from": "real_pdf", "total_funds": len(funds)}


def get_demo_portfolio() -> dict:
    return {
        "investor": {
            "name": "Rahul Sharma",
            "pan": "ABCDE1234F",
            "email": "rahul.sharma@gmail.com",
            "age": 32,
            "monthly_income": 120000,
            "monthly_expense": 65000,
        },
        "parsed_from": "demo",
        "total_funds": 6,
        "funds": [
            {
                "scheme_name": "Mirae Asset Large Cap Fund - Direct Growth",
                "scheme_code": "118989",
                "folio": "MIRAE/12345",
                "expense_ratio": 0.54,
                "category": "Large Cap",
                "current_value": 285000.0,
                "current_units": 8432.5,
                "transactions": [
                    {"date": "2020-01-10", "type": "Purchase", "amount": -10000, "units": 450.2, "nav": 22.21},
                    {"date": "2020-06-10", "type": "Purchase", "amount": -10000, "units": 390.6, "nav": 25.60},
                    {"date": "2021-01-10", "type": "Purchase", "amount": -10000, "units": 290.0, "nav": 34.48},
                    {"date": "2021-06-10", "type": "Purchase", "amount": -15000, "units": 365.8, "nav": 41.00},
                    {"date": "2022-01-10", "type": "Purchase", "amount": -15000, "units": 300.0, "nav": 50.00},
                    {"date": "2022-06-10", "type": "Purchase", "amount": -15000, "units": 330.0, "nav": 45.45},
                    {"date": "2023-01-10", "type": "Purchase", "amount": -15000, "units": 277.7, "nav": 54.02},
                    {"date": "2023-06-10", "type": "Purchase", "amount": -15000, "units": 241.9, "nav": 62.01},
                    {"date": "2024-01-10", "type": "Purchase", "amount": -15000, "units": 209.7, "nav": 71.53},
                    {"date": "2025-01-10", "type": "Purchase", "amount": -15000, "units": 175.3, "nav": 85.57},
                ],
            },
            {
                "scheme_name": "HDFC Top 100 Fund - Regular Growth",
                "scheme_code": "100270",
                "folio": "HDFC/67890",
                "expense_ratio": 1.67,
                "category": "Large Cap",
                "current_value": 195000.0,
                "current_units": 4210.3,
                "transactions": [
                    {"date": "2019-06-05", "type": "Purchase", "amount": -20000, "units": 890.2, "nav": 22.46},
                    {"date": "2019-12-05", "type": "Purchase", "amount": -20000, "units": 822.3, "nav": 24.32},
                    {"date": "2020-03-05", "type": "Purchase", "amount": -20000, "units": 1190.5, "nav": 16.80},
                    {"date": "2020-09-05", "type": "Purchase", "amount": -20000, "units": 680.3, "nav": 29.40},
                    {"date": "2021-03-05", "type": "Purchase", "amount": -20000, "units": 440.0, "nav": 45.45},
                    {"date": "2021-09-05", "type": "Purchase", "amount": -15000, "units": 270.3, "nav": 55.50},
                    {"date": "2022-03-05", "type": "Purchase", "amount": -15000, "units": 280.0, "nav": 53.57},
                ],
            },
            {
                "scheme_name": "Axis Bluechip Fund - Direct Growth",
                "scheme_code": "120503",
                "folio": "AXIS/24680",
                "expense_ratio": 0.44,
                "category": "Large Cap",
                "current_value": 142000.0,
                "current_units": 3850.0,
                "transactions": [
                    {"date": "2021-04-01", "type": "Purchase", "amount": -8000, "units": 270.3, "nav": 29.60},
                    {"date": "2021-10-01", "type": "Purchase", "amount": -8000, "units": 214.2, "nav": 37.35},
                    {"date": "2022-04-01", "type": "Purchase", "amount": -8000, "units": 223.5, "nav": 35.80},
                    {"date": "2022-10-01", "type": "Purchase", "amount": -8000, "units": 220.4, "nav": 36.30},
                    {"date": "2023-04-01", "type": "Purchase", "amount": -8000, "units": 192.3, "nav": 41.60},
                    {"date": "2024-01-01", "type": "Purchase", "amount": -8000, "units": 170.1, "nav": 47.03},
                    {"date": "2025-01-01", "type": "Purchase", "amount": -8000, "units": 147.0, "nav": 54.42},
                ],
            },
            {
                "scheme_name": "Parag Parikh Flexi Cap Fund - Direct Growth",
                "scheme_code": "122639",
                "folio": "PPFAS/13579",
                "expense_ratio": 0.63,
                "category": "Flexi Cap",
                "current_value": 320000.0,
                "current_units": 6540.2,
                "transactions": [
                    {"date": "2020-08-01", "type": "Purchase", "amount": -12000, "units": 480.0, "nav": 25.00},
                    {"date": "2021-02-01", "type": "Purchase", "amount": -12000, "units": 297.5, "nav": 40.34},
                    {"date": "2021-08-01", "type": "Purchase", "amount": -12000, "units": 233.8, "nav": 51.33},
                    {"date": "2022-02-01", "type": "Purchase", "amount": -12000, "units": 230.8, "nav": 51.99},
                    {"date": "2022-08-01", "type": "Purchase", "amount": -12000, "units": 220.5, "nav": 54.42},
                    {"date": "2023-02-01", "type": "Purchase", "amount": -12000, "units": 183.5, "nav": 65.39},
                    {"date": "2023-08-01", "type": "Purchase", "amount": -12000, "units": 158.1, "nav": 75.90},
                    {"date": "2024-02-01", "type": "Purchase", "amount": -15000, "units": 166.3, "nav": 90.20},
                    {"date": "2024-08-01", "type": "Purchase", "amount": -15000, "units": 147.8, "nav": 101.49},
                ],
            },
            {
                "scheme_name": "SBI Small Cap Fund - Regular Growth",
                "scheme_code": "125494",
                "folio": "SBI/97531",
                "expense_ratio": 1.74,
                "category": "Small Cap",
                "current_value": 98000.0,
                "current_units": 1240.6,
                "transactions": [
                    {"date": "2022-03-15", "type": "Purchase", "amount": -5000, "units": 95.2, "nav": 52.52},
                    {"date": "2022-09-15", "type": "Purchase", "amount": -5000, "units": 91.7, "nav": 54.52},
                    {"date": "2023-03-15", "type": "Purchase", "amount": -5000, "units": 77.3, "nav": 64.68},
                    {"date": "2023-09-15", "type": "Purchase", "amount": -5000, "units": 63.5, "nav": 78.74},
                    {"date": "2024-03-15", "type": "Purchase", "amount": -5000, "units": 55.2, "nav": 90.58},
                    {"date": "2024-09-15", "type": "Purchase", "amount": -5000, "units": 49.0, "nav": 102.04},
                ],
            },
            {
                "scheme_name": "Nippon India Index Fund Nifty 50 - Direct Growth",
                "scheme_code": "120716",
                "folio": "NIP/11223",
                "expense_ratio": 0.20,
                "category": "Index",
                "current_value": 85000.0,
                "current_units": 2100.0,
                "transactions": [
                    {"date": "2023-01-01", "type": "Purchase", "amount": -10000, "units": 520.8, "nav": 19.20},
                    {"date": "2023-07-01", "type": "Purchase", "amount": -10000, "units": 460.8, "nav": 21.70},
                    {"date": "2024-01-01", "type": "Purchase", "amount": -10000, "units": 401.4, "nav": 24.91},
                    {"date": "2024-07-01", "type": "Purchase", "amount": -10000, "units": 361.0, "nav": 27.70},
                    {"date": "2025-01-01", "type": "Purchase", "amount": -10000, "units": 315.0, "nav": 31.75},
                ],
            },
        ],
    }