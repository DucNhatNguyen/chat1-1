import { useMemo, useState } from "react";
import type { ID, User } from "@/types";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  mode: "direct" | "group";
  users: User[];
  currentUserId: ID;
  onClose: () => void;
  onCreateDirect: (userId: ID) => void;
  onCreateGroup: (name: string, userIds: ID[]) => void;
};

export function NewChatModal({
  open,
  mode,
  users,
  currentUserId,
  onClose,
  onCreateDirect,
  onCreateGroup,
}: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<ID>>(new Set());
  const [groupName, setGroupName] = useState("");

  const others = useMemo(
    () => users.filter(u => u.id !== currentUserId),
    [users, currentUserId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return others;
    return others.filter(u => u.name.toLowerCase().includes(q));
  }, [others, query]);

  function toggle(id: ID, multi: boolean) {
    setSelected(prev => {
      const next = new Set(prev);
      if (multi) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  }

  function handleCreate() {
    if (mode === "direct") {
      const id = Array.from(selected)[0];
      if (id) onCreateDirect(id);
    } else {
      const ids = Array.from(selected);
      if (ids.length) onCreateGroup(groupName, ids);
    }
  }

  function closeAndReset() {
    setQuery("");
    setSelected(new Set());
    setGroupName("");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={closeAndReset} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-w-[92vw] bg-white rounded-xl border border-neutral-200 shadow-xl">
        <div className="p-4 border-b border-neutral-200 flex items-center">
          <div className="font-semibold">
            {mode === "direct" ? "Tạo chat mới (DM)" : "Tạo nhóm chat"}
          </div>
          <button className="ml-auto h-8 w-8 grid place-items-center rounded hover:bg-neutral-100" onClick={closeAndReset}>
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {mode === "group" && (
            <div>
              <label className="text-sm text-neutral-600">Tên nhóm</label>
              <input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Nhập tên nhóm..."
                className="mt-1 w-full px-3 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          )}

          <div>
            <div className="relative">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm kiếm người dùng..."
                className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div className="mt-2 max-h-64 overflow-y-auto border border-neutral-200 rounded-md divide-y">
              {filtered.map(u => {
                const checked = selected.has(u.id);
                return (
                  <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-neutral-50 cursor-pointer">
                    <img src={u.avatarUrl} className="h-7 w-7 rounded-full object-cover" />
                    <div className="flex-1">{u.name}</div>
                    {mode === "group" ? (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(u.id, true)}
                      />
                    ) : (
                      <input
                        type="radio"
                        name="dm-select"
                        checked={checked}
                        onChange={() => toggle(u.id, false)}
                      />
                    )}
                  </label>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-3 text-sm text-neutral-500">Không tìm thấy người dùng</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-end gap-2">
          <button
            onClick={closeAndReset}
            className="h-9 px-3 rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={
              mode === "direct"
                ? selected.size !== 1
                : selected.size < 1
            }
            className="h-9 px-3 rounded-md bg-brand text-white disabled:opacity-50"
          >
            {mode === "direct" ? "Bắt đầu chat" : "Tạo nhóm"}
          </button>
        </div>
      </div>
    </div>
  );
}