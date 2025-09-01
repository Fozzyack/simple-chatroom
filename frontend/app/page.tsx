"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("chat_username") : null;
    if (saved) setUsername(saved);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username.");
      return;
    }
    localStorage.setItem("chat_username", trimmed);
    router.push("/chat");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-transparent border-2 border-red-500 rounded-none p-6 flex flex-col gap-4 shadow-[8px_8px_0_0_#ff2a2a]"
      >
        <h1 className="text-2xl font-bold uppercase tracking-wider">3nt3r yur u53rn4m3</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="3.g. 4l1c3"
          className="w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-2 outline-none focus:border-red-400 placeholder:text-red-300/60"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="rounded-none border-2 border-red-500 bg-black text-red-400 hover:bg-red-600 hover:text-black transition-colors px-4 py-2 font-bold uppercase tracking-wider"
        >
          J01n Ch4t
        </button>
      </form>
    </div>
  );
}
