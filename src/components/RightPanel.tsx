import type { Room, User } from "@/types";
import { UserRound, Users, Bell, Paperclip } from "lucide-react";

type Props = {
  room: Room;
  members: User[];
};

export function RightPanel({ room, members }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-neutral-200 bg-white">
        <div className="text-sm text-neutral-500">Room</div>
        <div className="font-semibold">{room.name}</div>
        <div className="mt-2 flex gap-2">
          <Badge icon={Users} label={`${members.length} members`} />
          <Badge icon={Bell} label="Notifications On" />
          <Badge icon={Paperclip} label="Files" />
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm font-medium mb-2">Members</div>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3">
              <img src={m.avatarUrl} className="h-7 w-7 rounded-full object-cover" />
              <div className="flex-1">
                <div className="text-sm">{m.name}</div>
                <div className="text-xs text-neutral-500">Member</div>
              </div>
              <button className="h-7 px-2 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs">
                Message
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto p-4 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <UserRound size={14} />
          You can add roles, manage notifications, and pin files here.
        </div>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-neutral-100 text-neutral-700">
      <Icon size={14} />
      {label}
    </div>
  );
}