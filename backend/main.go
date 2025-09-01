package main

import (
    "encoding/json"
    "log"
    "net/http"
    "sync"
    "time"

    "github.com/gorilla/websocket"
)

// Message is what the server broadcasts to all clients
type Message struct {
    User string `json:"user"`
    Text string `json:"text"`
    Time int64  `json:"time"`
}

// Incoming is what clients send to the server
type Incoming struct {
    Type     string `json:"type"`
    Username string `json:"username"`
    Text     string `json:"text"`
}

type Client struct {
    conn     *websocket.Conn
    send     chan []byte
    username string
}

type Outgoing struct {
    data    []byte
    exclude *Client // optional client to exclude (e.g., sender)
}

type Hub struct {
    mu       sync.RWMutex
    clients  map[*Client]bool
    register chan *Client
    remove   chan *Client
    broadcast chan Outgoing
}

func newHub() *Hub {
    return &Hub{
        clients:   make(map[*Client]bool),
        register:  make(chan *Client),
        remove:    make(chan *Client),
        broadcast: make(chan Outgoing, 256),
    }
}

func (h *Hub) run() {
    for {
        select {
        case c := <-h.register:
            h.mu.Lock()
            h.clients[c] = true
            h.mu.Unlock()
        case c := <-h.remove:
            h.mu.Lock()
            if _, ok := h.clients[c]; ok {
                delete(h.clients, c)
                close(c.send)
            }
            h.mu.Unlock()
        case out := <-h.broadcast:
            h.mu.RLock()
            for c := range h.clients {
                if out.exclude != nil && c == out.exclude {
                    continue
                }
                select {
                case c.send <- out.data:
                default:
                    // If client's send buffer is full, drop the client
                    delete(h.clients, c)
                    close(c.send)
                }
            }
            h.mu.RUnlock()
        }
    }
}

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    // Allow all origins for simplicity in local dev
    CheckOrigin: func(r *http.Request) bool { return true },
}

func serveWS(h *Hub, w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("websocket upgrade error: %v", err)
        return
    }

    client := &Client{conn: conn, send: make(chan []byte, 256)}
    h.register <- client

    // Reader
    go func() {
        defer func() {
            h.remove <- client
            client.conn.Close()
        }()
        client.conn.SetReadLimit(1 << 20) // 1MB
        client.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
        client.conn.SetPongHandler(func(string) error {
            client.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
            return nil
        })

        for {
            _, data, err := client.conn.ReadMessage()
            if err != nil {
                if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
                    log.Printf("client closed: %v", err)
                } else {
                    log.Printf("read error: %v", err)
                }
                break
            }

            var in Incoming
            if err := json.Unmarshal(data, &in); err != nil {
                // Ignore malformed
                continue
            }

            switch in.Type {
            case "join":
                if in.Username != "" {
                    client.username = in.Username
                }
                // Announce join
                m := Message{User: "system", Text: client.username + " joined", Time: time.Now().UnixMilli()}
                if payload, err := json.Marshal(m); err == nil {
                    h.broadcast <- Outgoing{data: payload}
                }
            case "message":
                user := client.username
                if user == "" {
                    user = in.Username
                }
                if user == "" || in.Text == "" {
                    continue
                }
                m := Message{User: user, Text: in.Text, Time: time.Now().UnixMilli()}
                if payload, err := json.Marshal(m); err == nil {
                    // Broadcast to everyone except sender to avoid duplicates client-side
                    h.broadcast <- Outgoing{data: payload, exclude: client}
                }
            default:
                // Unsupported types ignored
            }
        }
    }()

    // Writer
    go func() {
        ticker := time.NewTicker(30 * time.Second)
        defer func() {
            ticker.Stop()
            client.conn.Close()
        }()
        for {
            select {
            case msg, ok := <-client.send:
                client.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
                if !ok {
                    // Hub closed the channel
                    _ = client.conn.WriteMessage(websocket.CloseMessage, []byte{})
                    return
                }
                if err := client.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
                    return
                }
            case <-ticker.C:
                client.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
                if err := client.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
                    return
                }
            }
        }
    }()
}

func main() {
    hub := newHub()
    go hub.run()

    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "text/plain")
        w.WriteHeader(http.StatusOK)
        _, _ = w.Write([]byte("Chatroom backend running. WebSocket at /ws\n"))
    })
    mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
        serveWS(hub, w, r)
    })

    addr := ":8080"
    log.Printf("listening on %s", addr)
    if err := http.ListenAndServe(addr, mux); err != nil {
        log.Fatalf("server error: %v", err)
    }
}
