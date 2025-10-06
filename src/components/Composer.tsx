import { useState } from "react";
import { Paperclip, Smile, SendHorizontal, AtSign } from "lucide-react";
import clsx from "clsx";

type Props = {
  onSend: (text: string) => void;
  className?: string; // Thêm className
};

export function Composer({ onSend, className }: Props) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={clsx("border-t border-neutral-200 bg-white p-3", className)}>
      <div className="border border-neutral-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-brand-300">
        <div className="px-2 py-1 flex items-center gap-1 text-neutral-500">
          <button className="h-8 w-8 grid place-items-center hover:text-neutral-700" title="Mention">
            <AtSign size={18} />
          </button>
          <button className="h-8 w-8 grid place-items-center hover:text-neutral-700" title="Attach">
            <Paperclip size={18} />
          </button>
          <button className="h-8 w-8 grid place-items-center hover:text-neutral-700" title="Emoji">
            <Smile size={18} />
          </button>
        </div>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Write a message. Press Enter to send, Shift+Enter for newline."
          className="w-full px-3 pb-3 outline-none resize-none placeholder:text-neutral-400"
        />
        <div className="px-3 pb-3 flex items-center justify-end">
          <button
            onClick={handleSend}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-brand text-white hover:bg-brand-700 transition"
          >
            <SendHorizontal size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}