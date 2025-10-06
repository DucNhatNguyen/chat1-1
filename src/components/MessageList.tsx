import type { Message, User } from "@/types";
import { parseISO, format } from "date-fns";
import clsx from "clsx";
import { Copy, Undo2 } from "lucide-react";

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

export function MessageList({ messages, users, currentUserId, onToggleReaction, onRecall }: Props) {
  const userMap = new Map(users.map(u => [u.id, u]));

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
    <div className="h-full overflow-y-auto px-4 py-3 space-y-2 bg-neutral-50">
      {messages.map((m, idx) => {
        const u = userMap.get(m.userId)!;
        const isMine = m.userId === currentUserId;

        const prev = messages[idx - 1];
        const showHeader =
          !prev ||
          prev.userId !== m.userId ||
          parseISO(m.createdAt).getTime() - parseISO(prev.createdAt).getTime() > 5 * 60 * 1000;

        const hasReactions = m.reactions && Object.keys(m.reactions).length > 0;

        return (
          <div key={m.id} className={clsx("group flex gap-2", isMine && "justify-end")}>
            {!isMine && (
              <div className="mt-5">
                {showHeader ? <Avatar user={u} /> : <div className="w-[28px]" />}
              </div>
            )}

            <div className={clsx("max-w-[72%] relative")}>
              {showHeader && (
                <div className={clsx("text-xs mb-1", isMine ? "text-right" : "text-left")}>
                  <span className="font-medium text-neutral-700">{u.name}</span>{" "}
                  <span className="text-neutral-400">{format(parseISO(m.createdAt), "MMM d, HH:mm")}</span>
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
                  <div
                    className={clsx(
                      "absolute -top-3",
                      isMine ? "-left-2" : "-right-2",
                      "opacity-0 group-hover:opacity-100 transition pointer-events-none"
                    )}
                  >
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur px-1.5 py-1 rounded-lg border border-neutral-200 shadow pointer-events-auto">
                      {EMOJIS.map(e => (
                        <button
                          key={e}
                          onClick={() => onToggleReaction(m.id, e)}
                          className="h-6 w-6 grid place-items-center hover:bg-neutral-100 rounded"
                          title={`Thả ${e}`}
                        >
                          <span className="text-sm">{e}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => copyToClipboard(m.text)}
                        className="h-6 w-6 grid place-items-center hover:bg-neutral-100 rounded"
                        title="Copy"
                      >
                        <Copy size={14} className="text-neutral-600" />
                      </button>
                      {isMine && (
                        <button
                          onClick={() => onRecall(m.id)}
                          className="h-6 w-6 grid place-items-center hover:bg-neutral-100 rounded"
                          title="Thu hồi"
                        >
                          <Undo2 size={14} className="text-neutral-600" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {hasReactions && (
                <div className={clsx("mt-1 flex flex-wrap gap-1", isMine ? "justify-end" : "justify-start")}>
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