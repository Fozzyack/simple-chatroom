"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/types";

type Props = {
  messages: ChatMessage[];
  username: string | null;
};

export default function MessageList({ messages, username }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (atBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setUnread((u) => u + 1);
    }
  }, [messages, atBottom]);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    const threshold = 48;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBot = distance <= threshold;
    setAtBottom(atBot);
    if (atBot) setUnread(0);
  }

  function scrollToBottom() {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    setAtBottom(true);
    setUnread(0);
  }

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto rounded-none border-2 border-red-600 p-3 space-y-2 bg-black text-left shadow-[8px_8px_0_0_#ff2a2a]"
    >
      {messages.length === 0 && (
        <p className="text-sm opacity-70">N0 m3ss4g3s y3t. S4y h1!</p>
      )}
      {messages.map((m) => {
        const isSelf = username && m.user === username;
        return (
          <div key={m.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] flex items-center gap-2 p-2 `}>
              <div className={`min-w-[64px] ${isSelf ? "text-left pl-0" : "text-right pr-2"} text-xs text-red-300/70`}>
                {new Date(m.time).toLocaleTimeString()}
              </div>
              <div className="font-bold uppercase whitespace-nowrap">{m.user}:</div>
              <div className="whitespace-pre-wrap break-words flex-1">{m.text}</div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
      {!atBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="sticky left-full ml-[-6.25rem] bottom-3 float-right rounded-none border-2 border-red-500 bg-black text-red-400 hover:bg-red-600 hover:text-black transition-colors px-3 py-1 font-bold uppercase tracking-wider"
        >
          {unread > 0 ? `Scro11 D0wn (${unread})` : "Scro11 D0wn"}
        </button>
      )}
    </div>
  );
}
