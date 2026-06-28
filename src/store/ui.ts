import { create } from "zustand";
import type { AssetKind, HedgeSuggestion } from "../lib/api/types";

interface TradeTicketState {
  open: boolean;
  kind: AssetKind;
  id: string;
  label: string;
  price: number;
  side: "buy" | "sell";
  marketSide?: "YES" | "NO";
  hedgePair?: {
    stockSymbol: string;
    suggestion: HedgeSuggestion;
  };
  openTicket: (params: {
    kind: AssetKind;
    id: string;
    label: string;
    price: number;
    side?: "buy" | "sell";
    marketSide?: "YES" | "NO";
    hedgePair?: { stockSymbol: string; suggestion: HedgeSuggestion };
  }) => void;
  closeTicket: () => void;
  setSide: (side: "buy" | "sell") => void;
  setMarketSide: (side: "YES" | "NO") => void;
}

export const useUIStore = create<TradeTicketState>((set) => ({
  open: false,
  kind: "stock",
  id: "",
  label: "",
  price: 0,
  side: "buy",
  openTicket: (params) =>
    set({
      open: true,
      kind: params.kind,
      id: params.id,
      label: params.label,
      price: params.price,
      side: params.side ?? "buy",
      marketSide: params.marketSide,
      hedgePair: params.hedgePair,
    }),
  closeTicket: () =>
    set({
      open: false,
      hedgePair: undefined,
    }),
  setSide: (side) => set({ side }),
  setMarketSide: (side) => set({ marketSide: side }),
}));
