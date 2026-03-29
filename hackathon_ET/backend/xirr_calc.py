from datetime import date
from typing import List, Tuple

def compute_xirr(cashflows: List[Tuple[date, float]]) -> float:
    """
    Newton-Raphson XIRR implementation.
    cashflows: list of (date, amount) where negatives = outflows (purchases), positive = current value
    Returns annualized return as a decimal (e.g. 0.112 = 11.2%)
    """
    if not cashflows or len(cashflows) < 2:
        return 0.0

    dates = [cf[0] for cf in cashflows]
    amounts = [cf[1] for cf in cashflows]
    base_date = dates[0]

    def xnpv(rate):
        return sum(
            amt / ((1 + rate) ** ((d - base_date).days / 365.0))
            for d, amt in zip(dates, amounts)
        )

    def xnpv_deriv(rate):
        return sum(
            -((d - base_date).days / 365.0) * amt / ((1 + rate) ** ((d - base_date).days / 365.0 + 1))
            for d, amt in zip(dates, amounts)
        )

    rate = 0.1
    for _ in range(100):
        npv = xnpv(rate)
        d_npv = xnpv_deriv(rate)
        if abs(d_npv) < 1e-12:
            break
        new_rate = rate - npv / d_npv
        if abs(new_rate - rate) < 1e-6:
            rate = new_rate
            break
        rate = new_rate
        if rate < -0.999:
            rate = -0.999

    return round(rate, 4)


def fund_xirr(fund: dict) -> float:
    from datetime import date as date_cls
    cashflows = []
    for txn in fund.get("transactions", []):
        d = date_cls.fromisoformat(txn["date"])
        amt = txn["amount"]  # negative = purchase
        cashflows.append((d, amt))

    # Add current value as final positive cashflow (today)
    current_value = fund.get("current_value", 0)
    if current_value > 0:
        cashflows.append((date_cls.today(), current_value))

    return compute_xirr(cashflows)