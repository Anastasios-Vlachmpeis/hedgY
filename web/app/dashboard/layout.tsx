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
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

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
  { label: "Hedge", href: "/dashboard/hedge", icon: ShieldCheck },
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
  cls?: "equity" | "crypto";
};

const searchItems: SearchItem[] = [
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

// Two-tone gradient avatar — same palette as applai
const AVATAR_GRADIENTS: [string, string][] = [
  ["#3b82f6", "#ec4899"], ["#f59e0b", "#8b5cf6"], ["#06b6d4", "#d946ef"], ["#14b8a6", "#6366f1"],
  ["#facc15", "#ef4444"], ["#22c55e", "#3b82f6"], ["#fb923c", "#ec4899"], ["#a855f7", "#84cc16"],
];
const [avatarA, avatarB] = AVATAR_GRADIENTS[3]; // #14b8a6 → #6366f1 (teal→indigo)

function UserAvatar({ size = 10 }: { size?: number }) {
  return (
    <span
      className="block shrink-0 rounded-full"
      style={{
        width: size * 4,
        height: size * 4,
        background: `radial-gradient(circle at 30% 25%, ${avatarA}, transparent 72%), linear-gradient(140deg, ${avatarA}, ${avatarB})`,
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
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#e8e8e8] bg-white py-4 transition-[width] duration-200",
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
  const [assets, setAssets] = React.useState<SearchItem[]>([]);
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

  // Live asset search against the full Alpaca universe (debounced).
  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setAssets([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const rows: { symbol: string; name: string; exchange: string; cls: "equity" | "crypto" }[] = await res.json();
        setAssets(
          rows.map((r) => ({
            kind: "asset" as const,
            id: r.symbol,
            title: r.symbol,
            subtitle: r.name,
            venue: r.cls === "crypto" ? "Crypto" : r.exchange,
            cls: r.cls,
          })),
        );
      } catch {
        /* aborted or offline — keep prior results */
      }
    }, 160);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const markets = q
      ? searchItems.filter((i) => `${i.title} ${i.subtitle} ${i.venue}`.toLowerCase().includes(q))
      : searchItems.slice(0, 4);
    return [...assets, ...markets].slice(0, 10);
  }, [query, assets]);

  const choose = (item: SearchItem) => {
    if (item.kind === "asset") {
      // open the stock inline on the dashboard (it fetches live price + chart)
      window.dispatchEvent(new CustomEvent("verso:select-asset", { detail: { symbol: item.id } }));
    } else {
      window.dispatchEvent(new CustomEvent("verso:select-market", { detail: { marketId: item.id } }));
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
        "fixed right-0 top-0 z-40 flex h-[60px] items-center border-b border-[#e8e8e8] bg-white transition-[left] duration-200",
        collapsed ? "left-[60px]" : "left-[200px]",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1540px] items-center gap-4 px-8">
        <div className="flex-1">
          <SearchCommand />
        </div>
        <Link
          href="/dashboard/portfolio"
          className="flex shrink-0 items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-[#f8f8f8] rounded-[12px]"
        >
          <Wallet className="size-4 text-[#a3a3a3]" strokeWidth={1.8} />
          <div>
            <div className="text-[11px] font-medium text-[#a3a3a3]">Portfolio</div>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-[#0a0a0a]">
              $128,430.00
              <ChevronDown className="size-3 text-[#a3a3a3]" strokeWidth={1.8} />
            </div>
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
          "min-h-screen pt-[60px] transition-[padding-left] duration-200",
          collapsed ? "pl-[60px]" : "pl-[200px]",
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
