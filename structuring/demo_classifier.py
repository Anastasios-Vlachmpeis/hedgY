#!/usr/bin/env python3
"""
Worked numeric demo of the hedge classifier (template mode).
Reference implementation of the formulas in hedge-classifier.md - pure stdlib, no deps.
Runs all 5 starter templates from templates.json through sizing + scoring and prints a table.

Usage: python3 demo_classifier.py
"""
import json
import os

# P2-owned thresholds (see hedge-classifier.md section 6)
PARAMS = {
    "minEffect": 0.03,
    "minConfidence": 0.5,       # below this = "low-confidence" flag, NOT "unrelated"
    "offsetBand": (0.8, 1.25),
    "minHedgeQuality": 0.5,
    "premiumCapPct": None,       # None = full offset; e.g. 0.06 caps hedge spend at 6% of notional
}

# Sample live inputs for the demo (price = implied prob of the ADVERSE outcome; comes from connectors live)
SCENARIO = {
    "notional": 10_000.0,
    "price": {
        "defense_election":  0.40,
        "pharma_trial":      0.30,
        "shipping_hormuz":   0.20,
        "rates_fed":         0.35,
        "crypto_legislation":0.45,
    },
}


def assess(t, notional, price, params):
    move = t["moveAdverse"]          # signed, e.g. -0.25
    conf = t["confidence"]
    flags = []
    # Test 1 - linked? (effect size only; in template mode a causal link always exists)
    if abs(move) < params["minEffect"]:
        return {"classification": "unrelated", "reason": "effect too small", "conf": conf, "flags": flags}
    if conf < params["minConfidence"]:
        flags.append("low-confidence")   # flag only - does NOT demote the class
    # Test 2a - right sign? (long equity, contract pays in adverse state)
    pays_in_adverse = (t["expectedDirection"] == "adverse") and move < 0
    if not pays_in_adverse:
        return {"classification": "expression", "reason": "contract pays in equity's favorable state",
                "conf": conf, "flags": flags}
    # Test 2b - sizing + dollar offset
    L = notional * abs(move)
    budget = (params["premiumCapPct"] * notional) if params["premiumCapPct"] else float("inf")
    N = min(L / (1 - price), budget / price)
    hedge_cost = N * price
    net_gain_adverse = N * (1 - price)
    dollar_offset = net_gain_adverse / L
    hedge_quality = max(0.0, min(1.0, net_gain_adverse / L))
    # Test 2c - residual / basis risk (variance share not from this event)
    sigma_event = abs(move)
    sigma_other = t["sigmaOther"]
    residual = sigma_other**2 / (sigma_event**2 + sigma_other**2)
    # classify
    classification = "hedge" if hedge_quality >= params["minHedgeQuality"] else "expression"
    # payoff under each isolated outcome
    pnl_adverse = -L + net_gain_adverse          # ~0 at full offset (event loss neutralized)
    pnl_base = -hedge_cost                        # pay premium, keep upside
    return {
        "classification": classification, "conf": conf, "flags": flags,
        "L": L, "N": N, "hedge_cost": hedge_cost,
        "dollar_offset": dollar_offset, "hedge_quality": hedge_quality,
        "residual": residual, "pnl_adverse": pnl_adverse, "pnl_base": pnl_base,
        "expiry": t["expiryAlignment"],
    }


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "templates.json")) as f:
        cfg = json.load(f)

    n = SCENARIO["notional"]
    hdr = ["template", "move", "price", "L($)", "N", "prem($)", "offset", "qual", "resid", "conf", "class", "advPnL", "basePnL"]
    print(f"Notional per position: ${n:,.0f}   |   premiumCap: {PARAMS['premiumCapPct']}")
    print("-" * 124)
    print(("{:<19}{:>6}{:>6}{:>8}{:>7}{:>8}{:>7}{:>6}{:>7}{:>6}{:>8}{:>9}{:>9}").format(*hdr))
    print("-" * 124)
    low_conf_ids = []
    for t in cfg["templates"]:
        p = SCENARIO["price"][t["id"]]
        r = assess(t, n, p, PARAMS)
        if "low-confidence" in r.get("flags", []):
            low_conf_ids.append(t["id"])
        if "L" not in r:  # unrelated / expression early-exit
            print(("{:<19}{:>6.0%}{:>6.0%}{:>8}{:>7}{:>8}{:>7}{:>6}{:>7}{:>6.0%}{:>8}{:>9}{:>9}").format(
                t["id"], t["moveAdverse"], p, "-", "-", "-", "-", "-", "-", r["conf"], r["classification"], "-", "-"))
            continue
        print(("{:<19}{:>6.0%}{:>6.0%}{:>8,.0f}{:>7,.0f}{:>8,.0f}{:>7.2f}{:>6.0%}{:>7.0%}{:>6.0%}{:>8}{:>9,.0f}{:>9,.0f}").format(
            t["id"], t["moveAdverse"], p, r["L"], r["N"], r["hedge_cost"],
            r["dollar_offset"], r["hedge_quality"], r["residual"], r["conf"], r["classification"],
            r["pnl_adverse"], r["pnl_base"]))
    print("-" * 124)
    print("advPnL  = combined P&L if the adverse event happens (~0 = event loss neutralized).")
    print("basePnL = combined P&L if it does not (you pay the premium, keep equity upside).")
    print("resid   = share of equity risk NOT covered (market/sector/idio) -> disclosed to client.")
    if low_conf_ids:
        print("flag    = low-confidence (still a hedge, widen disclosure / shrink default size): " + ", ".join(low_conf_ids))


if __name__ == "__main__":
    main()
