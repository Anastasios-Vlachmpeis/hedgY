"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CreditCard,
  ExternalLink,
  History,
  Home,
  Landmark,
  LineChart,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Sun,
  Wallet,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { STOCKS_DB } from "@/lib/stocks";

const themeVars = {
  "--app-bg": "#F8F9FC",
  "--card-bg": "#FFFFFF",
  "--muted-surface": "#F5F6FA",
  "--border-soft": "#E7EAF0",
  "--text-primary": "#0F172A",
  "--text-secondary": "#64748B",
  "--text-muted": "#94A3B8",
  "--purple": "#7C5CFF",
  "--purple-light": "#F0ECFF",
  "--blue": "#4F8DFF",
  "--positive": "#16A34A",
  "--negative": "#EF4444",
  "--hedge": "#EC4899",
  "--button-black": "#050505",
} as React.CSSProperties;

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Home", href: "/dashboard", icon: Home },
      { label: "Watchlist", href: "/dashboard#watchlist", icon: Star },
    ],
  },
  {
    label: "TRADE",
    items: [
      { label: "Build position", href: "/dashboard", icon: ChartNoAxesCombined, selected: true },
      { label: "Positions", href: "/dashboard#positions", icon: SlidersHorizontal },
      { label: "Orders", href: "/dashboard#orders", icon: ReceiptText },
      { label: "History", href: "/dashboard#history", icon: History },
    ],
  },
  {
    label: "ANALYZE",
    items: [
      { label: "Markets", href: "/markets", icon: Landmark },
      { label: "Events", href: "/markets#events", icon: CalendarDays },
      { label: "Screeners", href: "/markets#screeners", icon: ShieldCheck },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Portfolio", href: "/dashboard#portfolio", icon: BriefcaseBusiness },
      { label: "Settings", href: "/dashboard#settings", icon: Settings },
      { label: "Billing", href: "/dashboard#billing", icon: CreditCard },
    ],
  },
];

type SearchItem = {
  kind: "asset" | "market";
  id: string;
  title: string;
  subtitle: string;
  venue: string;
  probability?: string;
};

const searchItems: SearchItem[] = [
  ...STOCKS_DB.map((s) => ({
    kind: "asset" as const,
    id: s.symbol,
    title: s.symbol,
    subtitle: `${s.name} · ${s.sector}`,
    venue: s.exchange,
  })),
  {
    kind: "market",
    id: "defense-budget-900",
    title: "US defense budget exceeds $900B",
    subtitle: "Prediction market · Defense risk",
    venue: "Kalshi",
    probability: "55%",
  },
  {
    kind: "market",
    id: "republicans-2026",
    title: "Republicans win 2026 midterms",
    subtitle: "Prediction market · Policy risk",
    venue: "Polymarket",
    probability: "43%",
  },
  {
    kind: "market",
    id: "hormuz-blockade-2026",
    title: "Strait of Hormuz blockade 2026",
    subtitle: "Prediction market · Geopolitics",
    venue: "Kalshi",
    probability: "17%",
  },
  {
    kind: "market",
    id: "fed-rate-cut-july",
    title: "Fed rate cut in July",
    subtitle: "Prediction market · Macro hedge",
    venue: "Kalshi / Polymarket",
    probability: "38%",
  },
  {
    kind: "market",
    id: "ai-chip-export-controls",
    title: "US expands AI chip export controls",
    subtitle: "Prediction market · Semiconductor risk",
    venue: "Polymarket",
    probability: "31%",
  },
];

function VersoMark() {
  return (
    <div className="relative size-7" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = 11 + Math.cos(angle) * 9;
        const y = 11 + Math.sin(angle) * 9;
        return (
          <span
            key={i}
            className="absolute size-[5px] rounded-full bg-[#050505]"
            style={{ left: x, top: y, opacity: i % 3 === 0 ? 0.45 : 1 }}
          />
        );
      })}
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-[var(--border-soft)] bg-white/88 px-5 py-6 backdrop-blur">
      <Link href="/dashboard" className="mb-9 flex items-center gap-3">
        <VersoMark />
        <span className="text-[25px] font-semibold tracking-[-0.04em] text-[#050505]">verso</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-2.5 text-[11px] font-semibold tracking-[0.03em] text-[#74809A]">
              {group.label}
            </div>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const selected =
                  item.selected || (item.href !== "/dashboard" && pathname === item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-[11px] px-3 text-[14px] font-medium transition-colors duration-150",
                      selected
                        ? "bg-[var(--purple-light)] text-[var(--purple)]"
                        : "text-[#5F6B85] hover:bg-[var(--muted-surface)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    <Icon className="size-[17px]" strokeWidth={1.9} />
                    <span>{item.label}</span>
                    {selected ? (
                      <span className="absolute right-3 size-1.5 rounded-full bg-[var(--purple)]" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6">
        <button
          type="button"
          className="group relative w-full overflow-hidden rounded-[17px] border border-[var(--border-soft)] bg-white p-4 text-left transition-colors hover:border-[#D8DDF0]"
        >
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[var(--text-primary)]">
                Invite friends
              </div>
              <div className="mt-1 text-[11px] font-medium text-[var(--text-secondary)]">
                Earn trading credits
              </div>
            </div>
            <ExternalLink className="mt-0.5 size-3.5 text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-8 h-12 rounded-[13px] bg-[linear-gradient(115deg,rgba(79,141,255,0.18),rgba(124,92,255,0.18)_45%,rgba(236,72,153,0.18))]">
            <div className="h-full w-full rounded-[13px] bg-[repeating-linear-gradient(160deg,rgba(124,92,255,0.18)_0_1px,transparent_1px_6px)] opacity-80" />
          </div>
        </button>

        <button
          type="button"
          className="mt-4 flex h-11 w-full items-center justify-between rounded-[12px] px-3 text-[13px] font-medium text-[#65708A] transition-colors hover:bg-[var(--muted-surface)]"
        >
          <span className="flex items-center gap-3">
            <Sun className="size-[18px]" strokeWidth={1.7} />
            Light mode
          </span>
          <ChevronDown className="size-4 -rotate-90" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}

function SearchCommand() {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    };
    const onFocusSearch = () => {
      setOpen(true);
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("verso:focus-search", onFocusSearch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("verso:focus-search", onFocusSearch);
    };
  }, []);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchItems.slice(0, 7);
    return searchItems
      .filter((item) =>
        `${item.title} ${item.subtitle} ${item.venue}`.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query]);

  const choose = (item: SearchItem) => {
    if (item.kind === "asset") {
      window.dispatchEvent(new CustomEvent("verso:select-asset", { detail: { symbol: item.id } }));
    } else {
      window.dispatchEvent(
        new CustomEvent("verso:select-market", { detail: { marketId: item.id } }),
      );
    }
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div
      className="relative w-full max-w-[520px]"
      onBlur={() => window.setTimeout(() => setOpen(false), 120)}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && results[0]) {
            event.preventDefault();
            choose(results[0]);
          }
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder="Search stocks, ETFs, events..."
        className="h-10 w-full rounded-[13px] border border-[var(--border-soft)] bg-[var(--muted-surface)]/70 pl-11 pr-20 text-[13px] font-medium text-[var(--text-primary)] outline-none transition-colors placeholder:text-[#7B849A] focus:border-[#D6D8FF] focus:bg-white focus:ring-4 focus:ring-[#7C5CFF]/10"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-[7px] border border-[#E2E5EE] bg-white px-1.5 py-0.5 text-[11px] font-semibold text-[#8892A8]">
        <span>⌘</span>
        <span>K</span>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-12 z-[80] overflow-hidden rounded-[16px] border border-[var(--border-soft)] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          <div className="border-b border-[var(--border-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">
            Stocks and prediction markets
          </div>
          <div className="max-h-[330px] overflow-y-auto p-1.5">
            {results.length ? (
              results.map((item) => {
                const Icon = item.kind === "asset" ? LineChart : Landmark;
                return (
                  <button
                    key={`${item.kind}-${item.id}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(item)}
                    className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-[var(--muted-surface)]"
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-[10px]",
                        item.kind === "asset"
                          ? "bg-[#EEF4FF] text-[var(--blue)]"
                          : "bg-[var(--purple-light)] text-[var(--purple)]",
                      )}
                    >
                      <Icon className="size-[17px]" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </span>
                      <span className="block truncate text-[12px] font-medium text-[var(--text-secondary)]">
                        {item.subtitle}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full border border-[var(--border-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                      {item.probability ?? item.venue}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="flex items-center gap-3 px-3 py-6 text-[13px] font-medium text-[var(--text-secondary)]">
                <X className="size-4" />
                No matching stock or prediction market
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Topbar() {
  return (
    <header className="fixed left-[220px] right-0 top-0 z-40 flex h-[72px] items-center border-b border-[var(--border-soft)] bg-white/86 px-8 backdrop-blur">
      <SearchCommand />

      <div className="ml-auto flex items-center gap-5">
        <button
          type="button"
          className="hidden text-left transition-opacity hover:opacity-75 sm:block"
        >
          <div className="text-[13px] font-semibold text-[var(--text-primary)]">Portfolio</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-[#53607A]">
            <Wallet className="size-3.5" strokeWidth={1.8} />
            $128,430.00
            <ChevronDown className="size-3.5" strokeWidth={1.8} />
          </div>
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-10 items-center justify-center rounded-full border border-transparent text-[#5F6B85] transition-colors hover:border-[var(--border-soft)] hover:bg-[var(--muted-surface)]"
        >
          <Bell className="size-[19px]" strokeWidth={1.8} />
        </button>
        <button type="button" className="flex items-center gap-3">
          <span
            className="block size-10 rounded-full"
            style={{ background: "radial-gradient(circle at 30% 25%, #9580ff, transparent 72%), linear-gradient(140deg, #9580ff, #4F8DFF)" }}
          />
          <ChevronDown className="size-4 text-[var(--purple)]" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={themeVars}
      className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] [font-family:Inter,system-ui,sans-serif]"
    >
      <Sidebar />
      <Topbar />
      <main className="min-h-screen pl-[220px] pt-[72px]">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
