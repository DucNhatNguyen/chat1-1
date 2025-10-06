import type { Message, User } from "@/types";
import { parseISO, format } from "date-fns";
import clsx from "clsx";
import { Copy, Undo2, MoreHorizontal, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  const [openAction, setOpenAction] = useState<{
    id: string;
    type: "emoji" | "more";
  } | null>(null);

  // Delay ẩn giống Zalo - sửa thành 1500ms cho thực tế hơn
  const HIDE_DELAY_MS = 1500;
  const hideTimerRef = useRef<number | null>(null);
  const clearCloseTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    clearCloseTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setOpenAction(null);
    }, HIDE_DELAY_MS);
  };
  useEffect(() => () => clearCloseTimer(), []);

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
      className="h-full min-h-0 overflow-y-auto px-4 py-3 space-y-2 bg-neutral-50"
      onClick={() => setOpenAction(null)}
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
            id={m.id}
            className={clsx("group flex gap-2", isMine && "justify-end")}
          >
            {!isMine && (
              <div className="mt-5">
                {showHeader ? <Avatar user={u} /> : <div className="w-[28px]" />}
              </div>
            )}

            <div className="relative max-w-[72%]">
              {showHeader && (
                <div
                  className={clsx(
                    "mb-1 text-xs",
                    isMine ? "text-right" : "text-left"
                  )}
                >
                  <span className="font-medium text-neutral-700">{u.name}</span>{" "}
                  <span className="text-neutral-400">
                    {format(parseISO(m.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              )}

              <div className="flex items-end">
                <div
                  className={clsx(
                    "relative whitespace-pre-wrap rounded-2xl px-3 py-2",
                    isMine
                      ? "bg-brand text-white rounded-br-sm"
                      : "rounded-bl-sm border border-neutral-200 bg-white text-neutral-900",
                    m.recalled && "opacity-70"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {m.recalled ? (
                    <span className="italic text-neutral-400">
                      Tin nhắn đã được thu hồi
                    </span>
                  ) : (
                    m.text
                  )}

                  {/* Reaction pill bám mép bong bóng */}
                  {!m.recalled && hasReactions && (
                    <div
                      className={clsx(
                        "absolute -bottom-3 inline-flex items-center gap-1 rounded-full border bg-white px-1.5 py-0.5 text-neutral-700 shadow-sm",
                        isMine ? "right-2" : "left-2"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Object.entries(m.reactions || {}).map(([emoji, ids]) => {
                        const mine = ids.includes(currentUserId);
                        return (
                          <button
                            key={emoji}
                            onClick={() => onToggleReaction(m.id, emoji)}
                            className={clsx(
                              "rounded-full px-1 py-0.5 text-xs leading-none",
                              mine
                                ? "bg-brand/10 text-brand-700"
                                : "hover:bg-neutral-50"
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

                  {/* Cụm nút tròn nổi cạnh bong bóng */}
                  {!m.recalled && (
                    <div
                      className={clsx(
                        "absolute top-1/2 -translate-y-1/2 z-10",
                        isMine
                          ? "left-0 -translate-x-full pr-2"
                          : "right-0 translate-x-full pl-2"
                      )}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={clearCloseTimer}
                      onMouseLeave={scheduleClose}
                    >
                      {/* Hàng nút */}
                      <div
                        className={clsx(
                          "flex items-center gap-1",
                          openAction?.id === m.id && openAction?.type === "emoji"
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100",
                          openAction?.id === m.id && openAction?.type === "more"
                            ? "flex"
                            : "hidden group-hover:flex"
                        )}
                      >
                        {/* Emoji */}
                        <button
                          onClick={() =>
                            setOpenAction((prev) =>
                              prev?.id === m.id && prev?.type === "emoji"
                                ? null
                                : { id: m.id, type: "emoji" }
                            )
                          }
                          className={clsx(
                            "grid h-8 w-8 place-items-center rounded-full",
                            "border border-neutral-200 bg-white/80 text-neutral-600 shadow-sm backdrop-blur",
                            "transition hover:bg-white hover:text-neutral-800 active:scale-95"
                          )}
                          title="Thả cảm xúc"
                        >
                          <Smile size={16} />
                        </button>
                        {/* Copy */}
                        <button
                          onClick={() => copyToClipboard(m.text)}
                          className={clsx(
                            "grid h-8 w-8 place-items-center rounded-full",
                            "border border-neutral-200 bg-white/80 text-neutral-600 shadow-sm backdrop-blur",
                            "transition hover:bg-white hover:text-neutral-800 active:scale-95"
                          )}
                          title="Sao chép"
                        >
                          <Copy size={16} />
                        </button>
                        {/* More */}
                        <button
                          onClick={() =>
                            setOpenAction((prev) =>
                              prev?.id === m.id && prev?.type === "more"
                                ? null
                                : { id: m.id, type: "more" }
                            )
                          }
                          className={clsx(
                            "grid h-8 w-8 place-items-center rounded-full",
                            "border border-neutral-200 bg-white/80 text-neutral-600 shadow-sm backdrop-blur",
                            "transition hover:bg-white hover:text-neutral-800 active:scale-95",
                            openAction?.id === m.id && openAction?.type === "more" && "bg-neutral-100"
                          )}
                          title="Tác vụ khác"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Popover Emoji */}
                      {openAction?.id === m.id && openAction?.type === "emoji" && (
                        <div
                          className={clsx(
                            "absolute bottom-full mb-2 z-50 flex gap-1 rounded-full border bg-white px-1.5 py-1 shadow",
                            isMine ? "left-0" : "right-0"
                          )}
                          role="menu"
                          onMouseEnter={clearCloseTimer}
                          onMouseLeave={scheduleClose}
                        >
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              onClick={() => {
                                onToggleReaction(m.id, e);
                                setOpenAction(null);
                              }}
                              className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-neutral-100"
                              title={`Thả ${e}`}
                            >
                              <span className="text-base leading-none">{e}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Dropdown More - Sửa thành absolute để định vị đơn giản */}
                      {openAction?.id === m.id && openAction?.type === "more" && (
                        <div
                          className={clsx(
                            "absolute z-50 w-52 rounded-lg border border-neutral-200 bg-white shadow-md",
                            // Thay vì fixed phức tạp, dùng absolute với vị trí cố định
                            isMine ? "right-full mr-2 top-0" : "left-full ml-2 top-0"
                          )}
                          role="menu"
                          onMouseEnter={clearCloseTimer}
                          onMouseLeave={scheduleClose}
                        >
                          <button
                            onClick={() => {
                              copyToClipboard(m.text);
                              setOpenAction(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            role="menuitem"
                            disabled={m.recalled}
                          >
                            <Copy size={14} className="text-neutral-600" />
                            Sao chép tin nhắn
                          </button>
                          {isMine && !m.recalled && (
                            <button
                              onClick={() => {
                                onRecall(m.id);
                                setOpenAction(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              role="menuitem"
                            >
                              <Undo2 size={14} />
                              Thu hồi tin nhắn
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Kết thúc bong bóng */}

                {isMine && <div className="w-[28px]" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}