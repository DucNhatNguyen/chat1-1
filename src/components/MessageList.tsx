import type { Message, User } from "@/types";
import { parseISO, format } from "date-fns";
import clsx from "clsx";
import { Copy, Undo2, MoreHorizontal, Smile, File as FileIcon, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

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

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function MessageList({
  messages,
  users,
  currentUserId,
  onToggleReaction,
  onRecall,
}: Props) {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const [openAction, setOpenAction] = useState<{ id: string; type: "emoji" | "more" } | null>(null);

  // Delay đóng action
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
    hideTimerRef.current = window.setTimeout(() => setOpenAction(null), HIDE_DELAY_MS);
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

  // Auto-scroll
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const prevCountRef = useRef<number>(messages.length);
  const scrollToBottom = (smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    } else if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    }
  };
  useEffect(() => {
    scrollToBottom(false);
  }, []);
  useEffect(() => {
    const el = listRef.current;
    const last = messages[messages.length - 1];
    const prevCount = prevCountRef.current;
    prevCountRef.current = messages.length;
    if (messages.length <= prevCount) return;
    const isLastMine = last?.userId === currentUserId;
    let nearBottom = true;
    if (el) {
      const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
      nearBottom = distance < 160;
    }
    if (isLastMine || nearBottom) scrollToBottom(true);
  }, [messages, currentUserId]);

  // Lightbox
  const [lightbox, setLightbox] = useState<{ open: boolean; slides: { src: string }[]; index: number }>({
    open: false,
    slides: [],
    index: 0,
  });
  const openLightbox = (msg: Message, attId: string) => {
    const imgs = (msg.attachments || []).filter((a) => a.type === "image");
    const slides = imgs.map((img) => ({ src: img.url }));
    const index = Math.max(0, imgs.findIndex((i) => i.id === attId));
    setLightbox({ open: true, slides, index });
  };

  // Ngưỡng nhóm tin nhắn liên tiếp (5 phút)
  const GROUP_GAP_MS = 5 * 60 * 1000;

  return (
    <div
      ref={listRef}
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
          parseISO(m.createdAt).getTime() - parseISO(prev.createdAt).getTime() > GROUP_GAP_MS;

        // Chỉ hiện giờ nếu là tin cuối của chuỗi liên tiếp
        const next = messages[idx + 1];
        const isTailOfGroup =
          !next ||
          next.userId !== m.userId ||
          parseISO(next.createdAt).getTime() - parseISO(m.createdAt).getTime() > GROUP_GAP_MS;

        const hasReactions = m.reactions && Object.keys(m.reactions).length > 0;
        const attachments = m.attachments || [];
        const images = attachments.filter((a) => a.type === "image");
        const videos = attachments.filter((a) => a.type === "video");
        const files = attachments.filter((a) => a.type === "file");
        const hasAttachments = attachments.length > 0;
        const imageOnly = images.length > 0 && videos.length === 0 && files.length === 0;

        return (
          <div key={m.id} id={m.id} className={clsx("group flex gap-2", isMine && "justify-end")}>
            {!isMine && (
              <div className="mt-5">{showHeader ? <Avatar user={u} /> : <div className="w-[28px]" />}</div>
            )}

            <div className="relative max-w-[72%]">
              {showHeader && (
                <div className={clsx("mb-1 text-xs", isMine ? "text-right" : "text-left")}>
                  <span className="font-medium text-neutral-700">{u.name}</span>
                </div>
              )}

              <div className="flex items-end">
                {/* Bubble */}
                <div
                  className={clsx(
                    "relative rounded-2xl px-3 py-2 bg-brand ",
                    // với media/file không cần whitespace-pre-wrap cho toàn bộ khối
                    !hasAttachments && "whitespace-pre-wrap",
                    isMine
                      ? imageOnly
                        ? "rounded-br-sm p-0"
                        : " text-white rounded-br-sm"
                      : "rounded-bl-sm border border-neutral-200 bg-white ",
                    m.recalled && "opacity-70",
                    // luôn chừa chỗ cố định cho reaction pill
                    !m.recalled && hasReactions && "mb-6"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {m.recalled ? (
                    <span className="italic text-neutral-400">Tin nhắn đã được thu hồi</span>
                  ) : (
                    <>
                      {hasAttachments ? (
                        (() => {
                          // 1 ảnh: style Zalo
                          if (images.length === 1 && videos.length === 0 && files.length === 0) {
                            const first = images[0];
                            return (
                              <div className="space-y-2">
                                <div className="relative rounded-md pl-2 pr-3 py-2 bg-neutral-100">
                                  <div
                                    className={clsx(
                                      "absolute left-0 top-0 bottom-0 w-[3px] rounded-l",
                                      isMine ? "bg-sky-300/90" : "bg-sky-400/90"
                                    )}
                                  />
                                  <div className="ml-2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(m, first.id);
                                      }}
                                      className="shrink-0"
                                      title="Xem ảnh"
                                    >
                                      <img
                                        src={first.url}
                                        alt={first.name || "image"}
                                        className="h-8 w-8 rounded-md object-cover"
                                      />
                                    </button>
                                    <div className="min-w-0">
                                      <div
                                        className={clsx(
                                          "truncate text-sm font-medium leading-tight",
                                          imageOnly && isMine ? "text-neutral-900" : isMine ? "text-white" : "text-neutral-900"
                                        )}
                                      >
                                        {userMap.get(m.userId)?.name || "Người dùng"}
                                      </div>
                                      <div
                                        className={clsx(
                                          "text-xs",
                                          imageOnly && isMine ? "text-neutral-600" : isMine ? "text-white/80" : "text-neutral-600"
                                        )}
                                      >
                                        [Hình ảnh]
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {m.text ? (
                                  <div
                                    className={clsx(
                                      "text-sm",
                                      imageOnly && isMine ? "text-white" : isMine ? "text-white" : "text-neutral-900"
                                    )}
                                  >
                                    {m.text}
                                  </div>
                                ) : null}
                              </div>
                            );
                          }

                          // Nhiều ảnh: lưới nhỏ 3 cột
                          if (images.length > 1 && videos.length === 0 && files.length === 0) {
                            return (
                              <div className="space-y-2">
                                <div className="inline-grid grid-cols-3 gap-1 w-fit max-w-full">
                                  {images.slice(0, 9).map((img, idx) => (
                                    <button
                                      key={img.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(m, img.id);
                                      }}
                                      className="relative block h-20 w-20 overflow-hidden rounded-md"
                                      title="Xem ảnh"
                                    >
                                      <img
                                        src={img.url}
                                        alt={img.name || `image-${idx + 1}`}
                                        className="h-full w-full object-cover bg-neutral-100"
                                      />
                                      {idx === 8 && images.length > 9 && (
                                        <div className="absolute inset-0 grid place-items-center bg-black/40 text-white text-lg font-semibold">
                                          +{images.length - 9}
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                                {m.text ? (
                                  <div
                                    className={clsx(
                                      "text-sm",
                                      imageOnly && isMine ? "text-neutral-900" : isMine ? "text-white" : "text-neutral-900"
                                    )}
                                  >
                                    {m.text}
                                  </div>
                                ) : null}
                              </div>
                            );
                          }

                          // Mixed: ảnh/video/file
                          return (
                            <div className="space-y-2">
                              <div className={clsx("grid gap-2", attachments.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                                {attachments.map((att) => {
                                  if (att.type === "image") {
                                    return (
                                      <button
                                        key={att.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openLightbox(m, att.id);
                                        }}
                                        className="block"
                                        title="Xem ảnh"
                                      >
                                        <img
                                          src={att.url}
                                          alt={att.name || "image"}
                                          className="rounded-md object-cover max-h-[180px] w-full"
                                        />
                                      </button>
                                    );
                                  }
                                  if (att.type === "video") {
                                    return (
                                      <div key={att.id} className="rounded-lg overflow-hidden">
                                        <video
                                          controls
                                          className="w-full max-h-[360px] bg-black"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <source src={att.url} type={att.mimeType || "video/mp4"} />
                                        </video>
                                      </div>
                                    );
                                  }
                                  // file
                                  return (
                                    <a
                                      key={att.id}
                                      href={att.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className={clsx(
                                        "flex items-center gap-3 rounded-lg border",
                                        isMine ? "border-white/20 bg-white/10" : "border-neutral-200 bg-neutral-50",
                                        "px-3 py-2 hover:bg-neutral-50/80"
                                      )}
                                    >
                                      <div
                                        className={clsx(
                                          "h-10 w-10 shrink-0 grid place-items-center rounded-md",
                                          isMine ? "bg-white/20 text-white" : "bg-white text-neutral-700 border border-neutral-200"
                                        )}
                                      >
                                        <FileIcon size={18} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className={clsx("truncate text-sm", isMine ? "text-white" : "text-neutral-800")}>
                                          {att.name || "Tệp đính kèm"}
                                        </div>
                                        <div className={clsx("text-xs", isMine ? "text-white/70" : "text-neutral-500")}>
                                          {formatBytes(att.size)} {att.mimeType ? `• ${att.mimeType}` : ""}
                                        </div>
                                      </div>
                                      <Download size={16} className={isMine ? "text-white/80" : "text-neutral-600"} />
                                    </a>
                                  );
                                })}
                              </div>
                              {m.text ? (
                                <div className={clsx("text-sm", isMine ? "text-white" : "text-neutral-900")}>{m.text}</div>
                              ) : null}
                            </div>
                          );
                        })()
                      ) : (
                        m.text
                      )}
                    </>
                  )}

                  {/* Reaction pill */}
                  {!m.recalled && hasReactions && (
                    <div
                      className={clsx(
                        "absolute -bottom-3 z-10 inline-flex items-center rounded-full border bg-white text-neutral-700 shadow-sm min-h-[24px]",
                        isMine ? "right-2" : "left-2",
                        "gap-1 px-1.5 py-0.5"
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
                              "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs leading-none",
                              mine ? "bg-brand/10 text-brand-700" : "hover:bg-neutral-50"
                            )}
                            title={mine ? "Bỏ cảm xúc" : "Thả cảm xúc"}
                          >
                            <span className="text-[14px]">{emoji}</span>
                            <span className="text-[11px]">{ids.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Nút hành động cạnh bong bóng */}
                  {!m.recalled && (
                    <div
                      className={clsx(
                        "absolute top-1/2 -translate-y-1/2 z-10",
                        isMine ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"
                      )}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={clearCloseTimer}
                      onMouseLeave={scheduleClose}
                    >
                      <div
                        className={clsx(
                          "flex items-center gap-1",
                          openAction?.id === m.id && openAction?.type === "emoji"
                            ? "flex opacity-0 pointer-events-none"
                            : openAction?.id === m.id && openAction?.type === "more"
                            ? "flex"
                            : openAction
                            ? "hidden"
                            : "hidden group-hover:flex"
                        )}
                      >
                        <button
                          onClick={() =>
                            setOpenAction((prev) =>
                              prev?.id === m.id && prev?.type === "emoji" ? null : { id: m.id, type: "emoji" }
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

                        <button
                          onClick={() => copyToClipboard(m.text || "")}
                          className={clsx(
                            "grid h-8 w-8 place-items-center rounded-full",
                            "border border-neutral-200 bg-white/80 text-neutral-600 shadow-sm backdrop-blur",
                            "transition hover:bg-white hover:text-neutral-800 active:scale-95"
                          )}
                          title="Sao chép"
                          disabled={!m.text}
                        >
                          <Copy size={16} />
                        </button>

                        <button
                          onClick={() =>
                            setOpenAction((prev) =>
                              prev?.id === m.id && prev?.type === "more" ? null : { id: m.id, type: "more" }
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

                      {/* Dropdown More */}
                      {openAction?.id === m.id && openAction?.type === "more" && (
                        <div
                          className={clsx(
                            "absolute z-50 w-52 rounded-lg border border-neutral-200 bg-white shadow-md",
                            isMine ? "right-full mr-2 top-0" : "left-full ml-2 top-0"
                          )}
                          role="menu"
                          onMouseEnter={clearCloseTimer}
                          onMouseLeave={scheduleClose}
                        >
                          <button
                            onClick={() => {
                              if (m.text) copyToClipboard(m.text);
                              setOpenAction(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            role="menuitem"
                            disabled={!m.text}
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

                {isMine && <div className="w-[28px]" />}
              </div>

              {/* Thời gian dưới bong bóng */}
              {isTailOfGroup && (
                <div
                  className={clsx(
                    "mt-1 text-[11px] text-neutral-500",
                    isMine ? "text-right" : "text-left"
                  )}
                >
                  {format(parseISO(m.createdAt), "HH:mm")}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
      <Lightbox
        open={lightbox.open}
        close={() => setLightbox((s) => ({ ...s, open: false }))}
        slides={lightbox.slides}
        index={lightbox.index}
        plugins={[Zoom]}
      />
    </div>
  );
}
