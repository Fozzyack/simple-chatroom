"use client";

import { ConnectionStatus } from "@/types";

type Props = {
  username: string | null;
  status: ConnectionStatus;
  onLeave: () => void;
};

export default function ChatHeader({ username, status, onLeave }: Props) {
  const displayStatus = {
    connecting: "c0nn3ct1ng",
    connected: "c0nn3ct3d",
    disconnected: "d1sc0nn3ct3d",
  }[status];

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b-2 border-red-600">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold uppercase tracking-wider">Ch47r00m</h1>
        <span
          className={{
            connecting: "text-yellow-400",
            connected: "text-red-400",
            disconnected: "text-red-500",
          }[status] + " text-sm uppercase"}
        >
          {displayStatus}
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        {username && <span className="opacity-80">{username}</span>}
        <button
          onClick={onLeave}
          className="rounded-none border-2 border-red-500 px-3 py-1 hover:bg-red-600 hover:text-black font-bold uppercase tracking-wider"
        >
          L34v3
        </button>
      </div>
    </header>
  );
}
