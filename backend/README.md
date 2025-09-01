# Chatroom Go Backend

Simple WebSocket chat server compatible with the frontend in `../frontend`.

## Endpoints
- `/` – Health check, plain text
- `/ws` – WebSocket endpoint

## Protocol
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

## Local Development
```bash
cd backend
go mod tidy
go run .
# or
go build -o chatroom-backend
./chatroom-backend
```
The server listens on `:8080`. The frontend default WS URL is `ws://localhost:8080/ws`.

## Notes
- All origins are allowed in the WebSocket upgrader for simplicity.
- In-memory hub; no persistence. Restart clears all connections.
