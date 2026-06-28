#!/usr/bin/env python3
"""
Worked numeric demo of the hedge classifier (template mode).
Reference implementation of the formulas in hedge-classifier.md - pure stdlib, no deps.
Runs all 5 starter templates from templates.json through sizing + scoring and prints a table.

Usage: python3 demo_classifier.py
"""
import json
import os

from structuring.hedge_math import (
    market_yes_prob,
    pays_as_hedge,
    residual_pct,
    size_two_state,
    yes_returns_from_legs,
)

# P2-owned thresholds (see hedge-classifier.md section 6)
PARAMS = {
    "minEffect": 0.03,
    "minConfidence": 0.5,       # below this = "low-confidence" flag, NOT "unrelated"
    "offsetBand": (0.8, 1.25),
    "minHedgeQuality": 0.5,
    "premiumCapPct": None,       # None = full offset; e.g. 0.06 caps hedge spend at 6% of notional
}

# Sample live inputs for the demo (price = implied prob of the side we BUY; comes from connectors live)
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


def assess(t, notional, leg_price, params):
    move = t["moveAdverse"]          # signed, e.g. -0.25
    conf = t["confidence"]
    hedge_leg = t["hedge"]["leg"]
    move_fav = t.get("moveFavorable")
    flags = []
    if abs(move) < params["minEffect"]:
        return {"classification": "unrelated", "reason": "effect too small", "conf": conf, "flags": flags}
    if conf < params["minConfidence"]:
        flags.append("low-confidence")   # flag only - does NOT demote the class
    if not pays_as_hedge(t.get("expectedDirection", "adverse"), move):
        return {"classification": "expression", "reason": "contract pays in equity's favorable state",
                "conf": conf, "flags": flags}
    ret_yes, ret_no = yes_returns_from_legs(move, hedge_leg, move_fav)
    p_yes = market_yes_prob(hedge_leg, leg_price)
    sized = size_two_state(
        notional, ret_yes, ret_no, p_yes, hedge_leg,
        premium_cap_pct=params.get("premiumCapPct"),
    )
    spread_ret = abs(ret_no - ret_yes)
    residual = residual_pct(t["sigmaOther"], ret_yes, ret_no)
    classification = "hedge" if sized["hedgeQuality"] >= params["minHedgeQuality"] else "expression"
    worst_ret = min(ret_yes, ret_no)
    pnl_adverse = sized["wealthGapUsd"] * -1 if worst_ret < 0 else 0
    pnl_base = -sized["premiumUsd"]
    return {
        "classification": classification, "conf": conf, "flags": flags,
        "L": sized["expectedLossUsd"], "N": sized["contracts"], "hedge_cost": sized["premiumUsd"],
        "dollar_offset": sized["dollarOffset"], "hedge_quality": sized["hedgeQuality"],
        "residual": residual, "pnl_adverse": pnl_adverse, "pnl_base": pnl_base,
        "expiry": t["expiryAlignment"], "approach": sized["approachNote"],
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
        print(f"  → {r['approach']}")
    print("-" * 124)
    print("advPnL  = combined P&L if the adverse event happens (~0 = event loss neutralized).")
    print("basePnL = combined P&L if it does not (you pay the premium, keep equity upside).")
    print("resid   = share of equity risk NOT covered (market/sector/idio) -> disclosed to client.")
    if low_conf_ids:
        print("flag    = low-confidence (still a hedge, widen disclosure / shrink default size): " + ", ".join(low_conf_ids))


if __name__ == "__main__":
    main()
