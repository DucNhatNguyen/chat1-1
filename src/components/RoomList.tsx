import type { Room, User } from "@/types";
import { Circle, CircleDot, Plus, Search, Users as UsersIcon } from "lucide-react";
import { parseISO, formatDistanceToNow } from "date-fns";

type Props = {
  rooms: Room[];
  users: User[];
  activeRoomId?: string;
  filter: string;
  onFilterChange: (q: string) => void;
  onSelectRoom: (id: string) => void;
  onNewDirect: () => void;
  onNewGroup: () => void;
};

export function RoomList({
  rooms,
  users,
  activeRoomId,
  filter,
  onFilterChange,
  onSelectRoom,
  onNewDirect,
  onNewGroup
}: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={filter}
            onChange={e => onFilterChange(e.target.value)}
            placeholder="Search rooms"
            className="w-full pl-9 pr-3 py-2 rounded-md bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={onNewDirect}
            className="inline-flex items-center gap-1 h-8 px-2 rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-sm"
            title="Tạo chat mới (DM)"
          >
            <Plus size={16} />
            DM
          </button>
          <button
            onClick={onNewGroup}
            className="inline-flex items-center gap-1 h-8 px-2 rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-sm"
            title="Tạo group chat"
          >
            <UsersIcon size={16} />
            Group
          </button>
        </div>
      </div>

      <div className="px-3 pb-2 text-xs text-neutral-500">Rooms</div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {rooms.map((r) => {
          const last = r.lastMessageAt ? formatDistanceToNow(parseISO(r.lastMessageAt), { addSuffix: true }) : "";
          const active = r.id === activeRoomId;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRoom(r.id)}
              className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-neutral-100 ${active ? "bg-brand/10" : ""}`}
            >
              <div className="h-10 w-10 rounded-lg bg-neutral-200 grid place-items-center text-neutral-700 text-sm">
                {r.name.split(" ").map(w => w[0]).slice(0,2).join("")}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <div className={`font-medium truncate ${active ? "text-brand-800" : "text-neutral-900"}`}>{r.name}</div>
                  {r.type === "group" ? <CircleDot size={12} className="text-neutral-400" /> : <Circle size={12} className="text-neutral-300" />}
                  <div className="text-[11px] text-neutral-500 ml-auto">{last}</div>
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  {r.members.length} members
                </div>
              </div>
              {r.unreadCount ? (
                <div className="ml-2 h-5 min-w-5 px-1.5 rounded-full bg-brand text-white text-[11px] grid place-items-center">
                  {r.unreadCount}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}