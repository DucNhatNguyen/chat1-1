import { MessageSquare, CheckSquare, Folder, Settings, Users } from "lucide-react";

export function Sidebar() {
  const items = [
    { icon: Users, label: "Contacts" },
    { icon: MessageSquare, label: "Chats", active: true },
    { icon: CheckSquare, label: "Tasks" },
    { icon: Folder, label: "Files" },
    { icon: Settings, label: "Settings" },
  ];
  return (
    <nav className="h-full w-16 border-r border-neutral-200 bg-white flex flex-col items-center py-3 gap-2">
      <div className="h-10 w-10 rounded-full bg-brand text-white grid place-items-center font-bold">
        CW
      </div>
      <div className="flex-1 flex flex-col items-center gap-1 mt-2">
        {items.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            title={label}
            className={`h-11 w-11 rounded-lg grid place-items-center text-neutral-500 hover:bg-neutral-100 ${active ? "bg-brand/10 text-brand-700" : ""}`}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
      <div className="text-[10px] text-neutral-400 pb-2">v0.1</div>
    </nav>
  );
}