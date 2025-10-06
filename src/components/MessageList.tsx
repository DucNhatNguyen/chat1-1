import type { Message, User } from "@/types";
import { parseISO, format } from "date-fns";
import clsx from "clsx";
import { Copy, Undo2, MoreHorizontal } from "lucide-react";
import { useState } from "react";

type Props = {
  messages: Message[];
  users: User[];
  currentUserId: string;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onRecall: (messageId: string) => void;
};

function Avatar({ user, size = 28 }: { user: User; size?: number }) {
  return (
    <img
      src={user.avatarUrl}
      alt={user.name}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  );
}

const EMOJIS = ["👍", "❤️", "😂", "🎉", "👀"];

export function MessageList({
  messages,
  users,
  currentUserId,
  onToggleReaction,
  onRecall,
}: Props) {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  return (
    <div
      className="h-full overflow-y-auto px-4 py-3 space-y-2 bg-neutral-50"
      onClick={() => setOpenMenuId(null)}
    >
      {messages.map((m, idx) => {
        const u = userMap.get(m.userId)!;
        const isMine = m.userId === currentUserId;

        const prev = messages[idx - 1];
        const showHeader =
          !prev ||
          prev.userId !== m.userId ||
          parseISO(m.createdAt).getTime() - parseISO(prev.createdAt).getTime() >
            5 * 60 * 1000;

        const hasReactions = m.reactions && Object.keys(m.reactions).length > 0;

        return (
          <div
            key={m.id}
            className={clsx("group flex gap-2", isMine && "justify-end")}
          >
            {!isMine && (
              <div className="mt-5">
                {showHeader ? (
                  <Avatar user={u} />
                ) : (
                  <div className="w-[28px]" />
                )}
              </div>
            )}

            <div className={clsx("max-w-[72%] relative")}>
              {showHeader && (
                <div
                  className={clsx(
                    "text-xs mb-1",
                    isMine ? "text-right" : "text-left"
                  )}
                >
                  <span className="font-medium text-neutral-700">{u.name}</span>{" "}
                  <span className="text-neutral-400">
                    {format(parseISO(m.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              )}

              <div
                className={clsx(
                  "px-3 py-2 rounded-2xl whitespace-pre-wrap relative",
                  isMine
                    ? "bg-brand text-white rounded-br-sm"
                    : "bg-white border border-neutral-200 text-neutral-900 rounded-bl-sm",
                  m.recalled && "opacity-70"
                )}
              >
                {m.recalled ? (
                  <span className="italic text-neutral-200 md:text-neutral-400">
                    Tin nhắn đã được thu hồi
                  </span>
                ) : (
                  m.text
                )}

                {!m.recalled && (
                  <>
                    {
                      /* Kebab trigger */
                      // Moved to bottom edge for better ergonomics
                    }
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) => (prev === m.id ? null : m.id));
                      }}
                      className={clsx(
                        "absolute -bottom-2 h-7 w-7 grid place-items-center rounded-full",
                        isMine ? "right-1" : "left-1",
                        "bg-white/80 border border-neutral-200 text-neutral-600 shadow-sm",
                        "opacity-0 group-hover:opacity-100 transition",
                        openMenuId === m.id && "opacity-100"
                      )}
                      title="Tác vụ"
                      aria-label="Mở danh sách tác vụ"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {/* Dropdown menu */}
                    {openMenuId === m.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={clsx(
                          "absolute z-20 w-52 rounded-lg border border-neutral-200 bg-white shadow-md",
                          isMine
                            ? "right-1 top-full mt-1.5"
                            : "left-1 top-full mt-1.5"
                        )}
                        role="menu"
                      >
                        <div className="px-2 py-1.5">
                          <div className="text-xs text-neutral-500 mb-1">
                            Thả cảm xúc
                          </div>
                          <div className="flex items-center gap-1.5">
                            {EMOJIS.map((e) => (
                              <button
                                key={e}
                                onClick={() => { onToggleReaction(m.id, e); setOpenMenuId(null); }}
                                className="h-7 w-7 grid place-items-center rounded-full hover:bg-neutral-100 transition"
                                title={`Thả ${e}`}
                                aria-label={`Thả cảm xúc ${e}`}
                              >
                                <span className="text-base leading-none">
                                  {e}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="h-px bg-neutral-200" />
                        <button
                          onClick={() => { copyToClipboard(m.text); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          role="menuitem"
                          disabled={m.recalled}
                        >
                          <Copy size={14} className="text-neutral-600" />
                          Sao chép tin nhắn
                        </button>
                        {isMine && !m.recalled && (
                          <button
                            onClick={() => { onRecall(m.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            role="menuitem"
                          >
                            <Undo2 size={14} />
                            Thu hồi tin nhắn
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {hasReactions && (
                <div
                  className={clsx(
                    "mt-1 flex flex-wrap gap-1",
                    isMine ? "justify-end" : "justify-start"
                  )}
                >
                  {Object.entries(m.reactions || {}).map(([emoji, ids]) => {
                    const mine = ids.includes(currentUserId);
                    return (
                      <button
                        key={emoji}
                        onClick={() => onToggleReaction(m.id, emoji)}
                        className={clsx(
                          "text-xs px-1.5 py-0.5 rounded-full border",
                          mine
                            ? "bg-brand/10 border-brand/30 text-brand-700"
                            : "bg-neutral-100 border-neutral-200 text-neutral-700"
                        )}
                        title={mine ? "Bỏ cảm xúc" : "Thả cảm xúc"}
                      >
                        <span className="mr-1">{emoji}</span>
                        <span>{ids.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {isMine && <div className="w-[28px]" />}
          </div>
        );
      })}
    </div>
  );
}