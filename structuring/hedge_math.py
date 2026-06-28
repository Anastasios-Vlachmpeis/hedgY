"""
structuring/hedge_math.py — two-state variance-minimising hedge (hedgingresearch model).

Wealth if YES resolves:  V₀(1 + r_yes)  + N(1 − c)
Wealth if NO resolves:    V₀(1 + r_no)   − N·c

Full offset: N = V₀(r_no − r_yes) on the market's YES contract (N < 0 ⇒ short YES / long NO).
"""
from __future__ import annotations


def yes_returns_from_legs(
    move_adverse: float,
    hedge_leg: str,
    move_favorable: float | None = None,
) -> tuple[float, float]:
    """Map template legs to (ret_if_yes, ret_if_no) for the market's YES contract."""
    mf = 0.0 if move_favorable is None else move_favorable
    if hedge_leg.upper() == "YES":
        return move_adverse, mf
    return mf, move_adverse


def market_yes_prob(hedge_leg: str, leg_price: float) -> float:
    """Implied P(YES) from the side/price we would buy."""
    return leg_price if hedge_leg.upper() == "YES" else 1.0 - leg_price


def residual_pct(sigma_other: float, ret_if_yes: float, ret_if_no: float) -> float:
    spread = abs(ret_if_no - ret_if_yes)
    if spread <= 0:
        return 1.0
    so = sigma_other
    return so * so / (spread * spread + so * so)


def pays_as_hedge(expected_direction: str, move_adverse: float) -> bool:
    """Long equity: contract must pay when the curated adverse state hits."""
    return expected_direction == "adverse" and move_adverse < 0


def approach_note(
    ret_if_yes: float,
    ret_if_no: float,
    p_yes: float,
    n_yes: float,
) -> str:
    """One-line disclosure for UI (mirrors hedgingresearch notebooks)."""
    action = "buy YES" if n_yes >= 0 else "buy NO (short YES)"
    return (
        f"Two-state lock: N = notional × ({ret_if_no:+.0%} − {ret_if_yes:+.0%}) "
        f"at P(YES)={p_yes:.0%}; {action} equalizes wealth across outcomes."
    )


def size_two_state(
    notional: float,
    ret_if_yes: float,
    ret_if_no: float,
    p_yes: float,
    hedge_leg: str,
    *,
    spread: float = 0.0,
    premium_cap_pct: float | None = None,
) -> dict:
    """Size a binary hedge to lock wealth across the two equity states."""
    p = min(max(p_yes, 0.01), 0.99)
    yes_cost = min(p + spread, 0.999)

    n_full = notional * (ret_if_no - ret_if_yes)
    spread_ret = abs(ret_if_no - ret_if_yes)

    budget = (premium_cap_pct * notional) if premium_cap_pct else float("inf")
    if n_full >= 0:
        n_yes = min(n_full, budget / yes_cost) if yes_cost > 0 else n_full
    else:
        n_yes = n_full

    if n_yes >= 0:
        exec_side = "YES"
        contracts = abs(n_yes)
        entry_price = yes_cost
    else:
        exec_side = "NO"
        contracts = abs(n_yes)
        entry_price = 1.0 - yes_cost

    # Actual cash outlay = contracts bought at the executed side's price
    # (YES fills at yes_cost; NO fills at 1 - yes_cost).
    premium_abs = abs(n_yes) * entry_price
    premium = premium_abs

    w_yes = notional * (1 + ret_if_yes) + n_yes * (1 - yes_cost)
    w_no = notional * (1 + ret_if_no) - n_yes * yes_cost
    wealth_gap = abs(w_no - w_yes)

    worst_ret = min(ret_if_yes, ret_if_no)
    l_spread = notional * spread_ret if spread_ret > 0 else 0.0
    worst_pnl_hedged = min(w_yes, w_no) - notional
    worst_pnl_unhedged = notional * worst_ret
    offset = (
        (worst_pnl_hedged - worst_pnl_unhedged) / abs(worst_pnl_unhedged)
        if worst_pnl_unhedged < 0
        else 1.0
    )
    hedge_quality = max(0.0, min(1.0, 1.0 - wealth_gap / l_spread if l_spread > 0 else 1.0))

    return {
        "retIfYes": ret_if_yes,
        "retIfNo": ret_if_no,
        "pYes": p,
        "yesCost": yes_cost,
        "nYes": n_yes,
        "contracts": round(contracts),
        "execSide": exec_side,
        "entryPrice": round(entry_price, 4),
        "premiumUsd": round(premium_abs, 2),
        "premiumSignedUsd": round(premium, 2),
        "wealthGapUsd": round(wealth_gap, 2),
        "dollarOffset": round(offset, 3),
        "hedgeQuality": round(hedge_quality, 3),
        "expectedLossUsd": round(l_spread, 2),
        "approachNote": approach_note(ret_if_yes, ret_if_no, p, n_yes),
    }
