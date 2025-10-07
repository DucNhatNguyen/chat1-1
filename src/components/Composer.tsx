import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Image as ImageIcon, Paperclip, SendHorizontal, X, Video } from "lucide-react";

type Props = {
  // Gửi kèm text và danh sách file đã chọn (khay chờ)
  onSend: (text: string, attachments: File[]) => void;
  className?: string;
};

type LocalPick = {
  id: string;
  file: File;
  url: string; // objectURL để preview
  type: "image" | "video" | "file";
};

function nextId() {
  return Math.random().toString(36).slice(2, 10);
}

export function Composer({ onSend, className }: Props) {
  const [value, setValue] = useState("");
  const [picks, setPicks] = useState<LocalPick[]>([]);

  // Thêm vào khay
  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    const mapped: LocalPick[] = files.map((f) => {
      const isImg = f.type.startsWith("image/");
      const isVid = f.type.startsWith("video/");
      return {
        id: nextId(),
        file: f,
        url: URL.createObjectURL(f),
        type: isImg ? "image" : isVid ? "video" : "file",
      };
    });
    setPicks((prev) => [...prev, ...mapped]);
    e.currentTarget.value = "";
  }

  function removePick(id: string) {
    setPicks((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function clearPicks() {
    setPicks((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }

  useEffect(() => {
    return () => {
      // cleanup khi unmount
      picks.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSend() {
    const files = picks.map((p) => p.file);
    if (!value.trim() && files.length === 0) return;
    onSend(value.trim(), files);
    setValue("");
    clearPicks();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={clsx("border-t border-neutral-200 bg-white p-3", className)}>
      {/* Khay chờ ảnh/video: hiển thị khi có picks */}
      {picks.length > 0 && (
        <div className="mb-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs text-neutral-600">Đính kèm: {picks.length} mục</div>
            <button
              onClick={clearPicks}
              className="text-xs text-neutral-500 hover:text-neutral-700"
              title="Xóa hết"
            >
              Xóa hết
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {picks.map((p) => (
              <div key={p.id} className="relative shrink-0">
                {p.type === "image" ? (
                  <img
                    src={p.url}
                    alt={p.file.name}
                    className="h-20 w-20 rounded-md object-cover border border-neutral-200 bg-white"
                  />
                ) : p.type === "video" ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border border-neutral-200 bg-black">
                    <video src={p.url} className="h-full w-full object-cover" muted />
                    <Video size={14} className="absolute left-1 top-1 text-white/90" />
                  </div>
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-md border border-neutral-200 bg-white text-xs text-neutral-600">
                    <Paperclip size={16} />
                    <span className="px-1 text-center line-clamp-2">{p.file.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removePick(p.id)}
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-neutral-700 shadow hover:bg-neutral-50 border"
                  title="Gỡ"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Nút chọn ảnh/video */}
        <label className="h-9 w-9 grid place-items-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer">
          <ImageIcon size={18} />
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={onPickFiles}
          />
        </label>

        {/* Nút chọn file (giữ nguyên nếu cần) */}
        <label className="h-9 w-9 grid place-items-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer">
          <Paperclip size={18} />
          <input type="file" multiple className="hidden" onChange={onPickFiles} />
        </label>

        {/* Ô nhập nội dung */}
        <div className="flex-1 min-w-0">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Nhập tin nhắn..."
            className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Gửi */}
        <button
          onClick={handleSend}
          className="h-9 px-3 rounded-lg bg-brand text-white hover:bg-brand/90 active:scale-[0.98]"
          title="Gửi"
        >
          <SendHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}