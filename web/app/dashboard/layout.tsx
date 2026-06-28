"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Home,
  Landmark,
  LineChart,
  Search,
  Settings,
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
  "--blue": "#4F8DFF",
  "--positive": "#16A34A",
  "--negative": "#EF4444",
  "--button-black": "#050505",
} as React.CSSProperties;

const mainNav = [
  { label: "Home", href: "/dashboard", icon: Home, exact: true },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: BriefcaseBusiness },
];

const bottomNav = [
  { label: "Settings", href: "/dashboard#settings", icon: Settings },
  { label: "Billing", href: "/dashboard#billing", icon: CreditCard },
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

function UserAvatar({ size = 10 }: { size?: number }) {
  return (
    <span
      className={`block rounded-full`}
      style={{
        width: size * 4,
        height: size * 4,
        background: "radial-gradient(circle at 30% 25%, #555555, transparent 72%), linear-gradient(140deg, #2a2a2a, #555555)",
        flexShrink: 0,
      }}
    />
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  selected,
  collapsed,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  selected: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex h-10 items-center rounded-[11px] text-[14px] transition-colors duration-150",
        collapsed ? "justify-center px-2 w-full" : "gap-3 px-3 font-medium",
        selected
          ? "bg-[#f0f0f0] text-[#0a0a0a]"
          : "text-[#5F6B85] hover:bg-[var(--muted-surface)] hover:text-[var(--text-primary)]",
      )}
    >
      <Icon className="size-[17px] shrink-0" strokeWidth={selected ? 2.4 : 1.9} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed bottom-3 left-3 top-3 z-50 flex flex-col rounded-[20px] border border-[#e8e8e8] bg-white py-4 shadow-[0_2px_20px_rgba(0,0,0,0.07)] transition-[width] duration-200",
        collapsed ? "w-[60px] items-center px-0" : "w-[200px] px-4",
      )}
    >
      {/* Logo */}
      <button
        type="button"
        onClick={onToggle}
        className={cn("mb-6 flex items-center", collapsed ? "justify-center" : "gap-3")}
      >
        <VersoMark />
        {!collapsed && (
          <span className="text-[22px] font-semibold tracking-[-0.04em] text-[#050505]">verso</span>
        )}
      </button>

      {/* Main nav */}
      <nav className={cn("flex flex-col gap-0.5", collapsed && "w-full px-2")}>
        {mainNav.map((item) => {
          const selected = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              selected={selected}
              collapsed={collapsed}
            />
          );
        })}
      </nav>

      {/* Bottom: Settings + Billing + User */}
      <div className={cn("mt-auto flex flex-col gap-0.5", collapsed && "w-full px-2")}>
        {bottomNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            selected={false}
            collapsed={collapsed}
          />
        ))}

        {/* User avatar */}
        <button
          type="button"
          className={cn(
            "mt-2 flex h-10 items-center rounded-[11px] transition-colors hover:bg-[var(--muted-surface)]",
            collapsed ? "justify-center px-2 w-full" : "gap-3 px-3",
          )}
          title={collapsed ? "Account" : undefined}
        >
          <UserAvatar size={9} />
          {!collapsed && (
            <span className="truncate text-[13px] font-medium text-[#5F6B85]">Account</span>
          )}
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
        className="h-10 w-full rounded-[13px] border border-[var(--border-soft)] bg-[var(--muted-surface)]/70 pl-11 pr-20 text-[13px] font-medium text-[var(--text-primary)] outline-none transition-colors placeholder:text-[#7B849A] focus:border-[#d0d0d0] focus:bg-white focus:ring-4 focus:ring-black/5"
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
                    <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#EEF4FF] text-[var(--blue)]">
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

function Topbar({ collapsed }: { collapsed: boolean }) {
  return (
    <header
      className={cn(
        "fixed right-4 top-3 z-40 flex h-[56px] items-center rounded-[16px] border border-[#e8e8e8] bg-white/95 px-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)] backdrop-blur-[10px] transition-[left] duration-200",
        collapsed ? "left-[83px]" : "left-[223px]",
      )}
    >
      <SearchCommand />

      <div className="ml-auto flex items-center">
        <Link
          href="/dashboard/portfolio"
          className="hidden text-left transition-opacity hover:opacity-75 sm:block"
        >
          <div className="text-[13px] font-semibold text-[var(--text-primary)]">Portfolio</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-[#53607A]">
            <Wallet className="size-3.5" strokeWidth={1.8} />
            $128,430.00
            <ChevronDown className="size-3.5" strokeWidth={1.8} />
          </div>
        </Link>
      </div>
    </header>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(true);
  return (
    <div
      style={themeVars}
      className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] [font-family:Inter,system-ui,sans-serif]"
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Topbar collapsed={collapsed} />
      <main
        className={cn(
          "min-h-screen pt-[76px] transition-[padding-left] duration-200",
          collapsed ? "pl-[83px]" : "pl-[223px]",
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
