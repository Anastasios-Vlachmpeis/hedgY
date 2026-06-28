import { Link, Outlet, useLocation } from "react-router-dom";
import { NavBar } from "./NavBar";
import { TradeTicket } from "./TradeTicket";

const PAGE_TITLES: Record<string, string> = {
  "/": "Portfolio",
  "/discover": "Discover",
  "/hedge": "Hedge",
  "/account": "Account",
};

export function Shell() {
  const location = useLocation();
  const isAsset = location.pathname.startsWith("/asset");

  const pageTitle = isAsset
    ? "Asset"
    : PAGE_TITLES[location.pathname] ?? "Hedge";

  return (
    <div className="flex min-h-full text-text">
      <NavBar />
      <div className="flex min-h-full flex-1 flex-col pl-64">
        <header className="glass sticky top-4 z-30 mx-6 mt-4 rounded-2xl px-6 py-3">
          <h1 className="text-sm font-medium uppercase tracking-wide text-text-dim">
            {pageTitle}
          </h1>
        </header>
        <main className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <TradeTicket />
    </div>
  );
}

export function PageHeader({
  title,
  backTo,
  subtitle,
}: {
  title: string;
  backTo?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      {backTo && (
        <Link
          to={backTo}
          className="mb-3 inline-block text-sm text-text-dim hover:text-text"
        >
          ← Back
        </Link>
      )}
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-base text-text-dim">{subtitle}</p>
      )}
    </div>
  );
}
