package controllers

import (
	"log"
	"net/http"

	"chatapp/utils"

	"github.com/gorilla/websocket"
)

// Upgrade HTTP to WebSocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // allow all origins
}

// Client represents a connected WebSocket client
type Client struct {
	Conn     *websocket.Conn
	Email    string
	Username string
}

// Map to store connected clients
var clients = make(map[*Client]bool)

// WebSocket handler
func HandleWS(w http.ResponseWriter, r *http.Request) {
	// Get token from query
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	email, err := utils.VerifyToken(token)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	client := &Client{Conn: conn, Email: email}
	clients[client] = true
	log.Printf("✅ WebSocket connected: %s", email)

	for {
		var msg struct {
			Content string `json:"content"`
		}
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("read error:", err)
			delete(clients, client)
			break
		}

		// Broadcast message to all clients
		for c := range clients {
			err := c.Conn.WriteJSON(struct {
				Username string `json:"username"`
				Content  string `json:"content"`
			}{
				Username: email, // you can store username too if you want
				Content:  msg.Content,
			})
			if err != nil {
				log.Println("write error:", err)
				c.Conn.Close()
				delete(clients, c)
			}
		}
	}
}
