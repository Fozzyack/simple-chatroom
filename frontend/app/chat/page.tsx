"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatHeader from "@/components/ChatHeader";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import type { ChatMessage, ConnectionStatus } from "@/types";

export default function ChatPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  

  const wsUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
  }, []);

  // Load username or redirect
  useEffect(() => {
    const stored = localStorage.getItem("chat_username");
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsername(stored);
  }, [router]);

  // Connect WebSocket
  useEffect(() => {
    if (!username) return;
    setStatus("connecting");
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        // announce join if backend expects it
        safeSend(ws, { type: "join", username });
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          // Expecting either {user, text, time} or similar
          if (typeof data === "object" && data) {
            // If backend echoes messages back to the sender, ignore those
            if (username && data.user === username) {
              return;
            }
            const msg: ChatMessage = {
              id: crypto.randomUUID(),
              user: data.user ?? "unknown",
              text: data.text ?? JSON.stringify(data),
              time: data.time ?? Date.now(),
            };
            setMessages((prev) => [...prev, msg]);
          }
        } catch {
          // Fallback: treat raw as text
          const msg: ChatMessage = {
            id: crypto.randomUUID(),
            user: "server",
            text: String(ev.data),
            time: Date.now(),
          };
          setMessages((prev) => [...prev, msg]);
        }
      };

      ws.onclose = () => {
        setStatus("disconnected");
      };

      ws.onerror = () => {
        setStatus("disconnected");
      };

      return () => {
        ws.close();
      };
    } catch {
      setStatus("disconnected");
    }
  }, [username, wsUrl]);

  // (scroll and unread are encapsulated in MessageList)

  function safeSend(ws: WebSocket, payload: any) {
    try {
      ws.send(JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  function handleSend(text: string) {
    if (!text || !username) return;

    // Optimistically add locally (backend does not echo to sender)
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        user: username,
        text,
        time: Date.now(),
      },
    ]);

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      safeSend(ws, { type: "message", username, text });
    }
  }

  function handleLeave() {
    localStorage.removeItem("chat_username");
    wsRef.current?.close();
    router.replace("/");
  }

  return (
    <div className="h-screen md:h-dvh flex flex-col overflow-hidden">
      <ChatHeader username={username} status={status} onLeave={handleLeave} />

      <main className="flex-1 flex flex-col overflow-hidden max-w-3xl w-full mx-auto px-4 py-4 gap-4">
        <MessageList messages={messages} username={username} />

        <MessageInput status={status} onSend={handleSend} />
      </main>
    </div>
  );
}
