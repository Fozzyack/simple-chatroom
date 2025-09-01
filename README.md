# Chatroom

Simple real‑time chat app with a Next.js frontend and a Go WebSocket backend.

## Repo Structure
- `frontend/`: Next.js app (App Router, Tailwind v4)
- `backend/`: Go WebSocket server (Gorilla WebSocket)

## Quick Start
Requirements: Node 18+, npm, Go 1.22+

### Backend
```bash
cd backend
go mod tidy
go run .
# Server at http://localhost:8080 (WebSocket at ws://localhost:8080/ws)
```

### Frontend
```bash
cd frontend
npm install
# Optional: configure WebSocket URL
cp .env.local.example .env.local
# edit .env.local if needed (NEXT_PUBLIC_WS_URL)

npm run dev
# Open http://localhost:3000
```

## Features
- Username gate → join chat instantly
- Real‑time messaging over WebSockets
- Right‑aligned self messages, left‑aligned others
- Scrollable history with sticky “scroll to bottom” and unread count
- Terminal‑style brutalist UI, red mono theme with leetspeak text

## WebSocket Protocol
Client → Server (join):
```json
{ "type": "join", "username": "alice" }
```

Client → Server (message):
```json
{ "type": "message", "username": "alice", "text": "hello" }
```

Server → Clients (broadcast):
```json
{ "user": "alice", "text": "hello", "time": 1735752440000 }
```

## Configuration
- Frontend: `NEXT_PUBLIC_WS_URL` in `frontend/.env.local`
- Backend: listens on `:8080` by default

## Common Commands
Frontend:
```bash
npm run dev
npm run build
npm start
```

Backend:
```bash
go run .
go build -o chatroom-backend && ./chatroom-backend
```

## Troubleshooting
- No messages / connect errors: ensure the backend is running and `NEXT_PUBLIC_WS_URL` matches (e.g., `ws://localhost:8080/ws`).
- Mixed content in browser: use `ws://` with `http://` and `wss://` with `https://`.
- Port conflicts: change frontend port (`PORT=3001 npm run dev`) or backend listen addr in `backend/main.go`.
