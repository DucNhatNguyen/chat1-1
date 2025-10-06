import { Info, PanelRightOpen, PanelRightClose, Search } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  rightOpen: boolean;
  onToggleRight: () => void;
};

export function ChatHeader({ title, subtitle, rightOpen, onToggleRight }: Props) {
  return (
    <header className="h-14 border-b border-neutral-200 bg-white px-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-xs text-neutral-500 truncate">{subtitle}</div>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="Search in conversation"
            className="w-64 pl-9 pr-3 py-1.5 rounded-md bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <button className="h-9 px-3 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 flex items-center gap-2">
          <Info size={16} />
          Details
        </button>
      </div>
      <button
        onClick={onToggleRight}
        className="h-9 w-9 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 grid place-items-center"
        title={rightOpen ? "Hide panel" : "Show panel"}
      >
        {rightOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
      </button>
    </header>
  );
}