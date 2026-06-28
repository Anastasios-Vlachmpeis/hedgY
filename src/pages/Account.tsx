import { Settings, Shield, Wallet } from "lucide-react";
import { formatMoney } from "../lib/format";
import { Card } from "../components/Card";

const SETTINGS = [
  { icon: Wallet, label: "Buying power", value: formatMoney(12_450.0) },
  { icon: Shield, label: "Risk disclosures", value: "" },
  { icon: Settings, label: "Preferences", value: "" },
];

export function Account() {
  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">Account</h2>
        <p className="mt-1 text-text-dim">Profile and settings</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <div className="text-center md:text-left">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-3xl font-bold text-white shadow-[0_8px_24px_rgba(0,0,128,0.4)] md:mx-0">
            NH
          </div>
          <h3 className="text-xl font-semibold">Nick</h3>
          <p className="text-sm text-text-dim">Individual account</p>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-xs uppercase tracking-wide text-text-dim">
              Buying power
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums">
              {formatMoney(12_450.0)}
            </p>
          </Card>

          <Card className="divide-y divide-border p-0">
            {SETTINGS.map(({ icon: Icon, label, value }) => (
              <button
                key={label}
                type="button"
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2"
              >
                <Icon className="h-5 w-5 text-text-dim" />
                <span className="flex-1 font-medium">{label}</span>
                {value && (
                  <span className="text-sm text-text-dim tabular-nums">{value}</span>
                )}
              </button>
            ))}
          </Card>

          <p className="text-sm leading-relaxed text-text-dim">
            This app provides suggestions only. You execute trades on your own
            venues. No real money moves through this interface.
          </p>
        </div>
      </div>
    </div>
  );
}
