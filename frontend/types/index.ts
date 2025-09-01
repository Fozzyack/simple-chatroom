export type ChatMessage = {
  id: string;
  user: string;
  text: string;
  time: number;
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

