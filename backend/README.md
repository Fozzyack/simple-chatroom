Chatroom Go Backend

Simple WebSocket chat server compatible with the frontend in ../frontend.

Endpoints:

- `/`  – Health check, plain text.
- `/ws` – WebSocket endpoint.

Protocol:

- Client join: `{ "type": "join", "username": "alice" }`
- Client message: `{ "type": "message", "username": "alice", "text": "hello" }`
- Server broadcast: `{ "user": "alice", "text": "hello", "time": <ms since epoch> }`

Local development

1. From `backend/`, ensure modules are fetched:
   - `go mod tidy`
2. Build and run:
   - `go build -o chatroom-backend`  (or `go run .`)
   - `./chatroom-backend`
3. The server listens on `:8080`. Frontend default WS URL is `ws://localhost:8080/ws`.

Notes

- All origins are allowed in the WebSocket upgrader for simplicity.
- In-memory hub; no persistence. Restart clears all connections.

