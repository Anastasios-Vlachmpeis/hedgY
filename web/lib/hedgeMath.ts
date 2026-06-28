/**
 * Two-state hedge sizing (mirrors structuring/hedge_math.py + hedgingresearch notebooks).
 *
 * N_yes = notional × (r_no − r_yes) locks wealth across YES/NO resolution states.
 */

export interface HedgeCalibration {
  /** Signed equity return when the adverse outcome hits. */
  moveAdverse: number;
  /** Signed equity return when the favorable outcome hits. */
  moveFavorable: number;
  /** Implied P(YES) on the matched market question. */
  yesProbability: number;
  /** Side we buy to execute the hedge. */
  hedgeLeg: "YES" | "NO";
  /** Optional half-spread added to YES cost (0..1). */
  spread?: number;
}

export interface TwoStateSizing {
  retIfYes: number;
  retIfNo: number;
  pYes: number;
  yesCost: number;
  nYes: number;
  contracts: number;
  execSide: "YES" | "NO";
  entryPrice: number;
  premiumUsd: number;
  premiumSignedUsd: number;
  wealthGapUsd: number;
  hedgeQuality: number;
  approachNote: string;
}

export function yesReturnsFromLegs(
  moveAdverse: number,
  hedgeLeg: "YES" | "NO",
  moveFavorable = 0,
): { retIfYes: number; retIfNo: number } {
  if (hedgeLeg === "YES") {
    return { retIfYes: moveAdverse, retIfNo: moveFavorable };
  }
  return { retIfYes: moveFavorable, retIfNo: moveAdverse };
}

export function approachNote(
  retIfYes: number,
  retIfNo: number,
  pYes: number,
  nYes: number,
): string {
  const pct = (x: number) => `${x >= 0 ? "+" : ""}${Math.round(x * 100)}%`;
  const action = nYes >= 0 ? "buy YES" : "buy NO (short YES)";
  return `Two-state lock: N = notional × (${pct(retIfNo)} − ${pct(retIfYes)}) at P(YES)=${Math.round(pYes * 100)}%; ${action} equalizes wealth across outcomes.`;
}

export function sizeTwoState(
  notional: number,
  cal: HedgeCalibration,
): TwoStateSizing {
  const { retIfYes, retIfNo } = yesReturnsFromLegs(
    cal.moveAdverse,
    cal.hedgeLeg,
    cal.moveFavorable,
  );
  const spread = cal.spread ?? 0;
  const p = Math.min(Math.max(cal.yesProbability, 0.01), 0.99);
  const yesCost = Math.min(p + spread, 0.999);

  const nYes = notional * (retIfNo - retIfYes);

  let execSide: "YES" | "NO";
  let contracts: number;
  let entryPrice: number;

  if (nYes >= 0) {
    execSide = "YES";
    contracts = Math.abs(nYes);
    entryPrice = yesCost;
  } else {
    execSide = "NO";
    contracts = Math.abs(nYes);
    entryPrice = 1 - yesCost;
  }

  const premiumSignedUsd = nYes * yesCost;
  const premiumUsd = Math.abs(premiumSignedUsd);

  const wYes = notional * (1 + retIfYes) + nYes * (1 - yesCost);
  const wNo = notional * (1 + retIfNo) - nYes * yesCost;
  const wealthGapUsd = Math.abs(wNo - wYes);
  const spreadRet = Math.abs(retIfNo - retIfYes);
  const hedgeQuality =
    spreadRet > 0 ? Math.max(0, Math.min(1, 1 - wealthGapUsd / (notional * spreadRet))) : 1;

  return {
    retIfYes,
    retIfNo,
    pYes: p,
    yesCost,
    nYes,
    contracts: Math.round(contracts),
    execSide,
    entryPrice,
    premiumUsd,
    premiumSignedUsd,
    wealthGapUsd,
    hedgeQuality,
    approachNote: approachNote(retIfYes, retIfNo, p, nYes),
  };
}

/** Scale full two-state sizing by a hedge ratio in [0, 1]. */
export function scaleSizing(
  notional: number,
  s: TwoStateSizing,
  ratio: number,
): TwoStateSizing {
  const r = Math.max(0, Math.min(1, ratio));
  const nYes = s.nYes * r;
  const premiumSignedUsd = nYes * s.yesCost;
  const wYes = hedgedWealth(notional, s.retIfYes, nYes, s.yesCost, true);
  const wNo = hedgedWealth(notional, s.retIfNo, nYes, s.yesCost, false);
  const wealthGapUsd = Math.abs(wNo - wYes);
  const spreadRet = Math.abs(s.retIfNo - s.retIfYes);
  const hedgeQuality =
    spreadRet > 0 && notional > 0
      ? Math.max(0, Math.min(1, 1 - wealthGapUsd / (notional * spreadRet)))
      : 1;
  return {
    ...s,
    nYes,
    contracts: Math.round(Math.abs(nYes)),
    premiumUsd: Math.round(Math.abs(premiumSignedUsd)),
    premiumSignedUsd: Math.round(premiumSignedUsd),
    wealthGapUsd,
    hedgeQuality,
  };
}

export function hedgedWealth(
  notional: number,
  ret: number,
  nYes: number,
  yesCost: number,
  yesHappened: boolean,
): number {
  const base = notional * (1 + ret);
  return yesHappened ? base + nYes * (1 - yesCost) : base - nYes * yesCost;
}
