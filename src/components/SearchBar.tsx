import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-inset w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-text-dim focus:border-up/50 focus:outline-none"
      />
    </div>
  );
}
