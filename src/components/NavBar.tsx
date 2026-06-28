import { NavLink } from "react-router-dom";
import { Home, Search, Shield, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/discover", icon: Search, label: "Discover" },
  { to: "/hedge", icon: Shield, label: "Hedge", hero: true },
  { to: "/account", icon: User, label: "Account" },
];

function NavItem({
  to,
  icon: Icon,
  label,
  hero,
}: {
  to: string;
  icon: typeof Home;
  label: string;
  hero?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all",
          isActive
            ? "bg-accent text-white shadow-[0_4px_16px_rgba(0,0,128,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]"
            : "text-text-dim hover:bg-white/5 hover:text-text",
          hero ? "font-semibold" : "font-medium",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={hero ? "h-5 w-5" : "h-4 w-4"}
            strokeWidth={isActive ? 2.5 : 2}
          />
          <span>{label}</span>
          {hero && (
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isActive ? "bg-white/25 text-white" : "bg-accent text-white"
              }`}
            >
              Core
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function NavBar() {
  return (
    <nav
      className="glass fixed inset-y-4 left-4 z-40 flex w-56 flex-col rounded-3xl"
      aria-label="Main navigation"
    >
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-lg font-bold tracking-tight text-text">Hedge</p>
        <p className="text-xs text-text-dim">Stocks + Markets</p>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <p className="text-[11px] leading-relaxed text-text-dim">
          Suggest-only. Execute on your own venues.
        </p>
      </div>
    </nav>
  );
}
