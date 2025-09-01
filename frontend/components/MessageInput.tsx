"use client";

import { useState } from "react";
import { ConnectionStatus } from "@/types";

type Props = {
  status: ConnectionStatus;
  onSend: (text: string) => void;
};

export default function MessageInput({ status, onSend }: Props) {
  const [input, setInput] = useState("");
  const disabled = status !== "connected";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={status === "connected" ? "Typ3 4 m3ss4g3" : "C0nn3ct1ng..."}
        className="flex-1 rounded-none border-2 border-red-600 bg-transparent px-3 py-2 outline-none focus:border-red-400 placeholder:text-red-300/60"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || input.trim().length === 0}
        className="rounded-none border-2 border-red-500 bg-black text-red-400 hover:bg-red-600 hover:text-black transition-colors px-4 py-2 font-bold uppercase tracking-wider disabled:opacity-50"
      >
        S3nd
      </button>
    </form>
  );
}
