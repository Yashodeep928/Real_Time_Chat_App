package routes

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
	"chatapp/hub"
)

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // allow all origins (for dev)
	},
}

// WebSocket handler
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	log.Println("⚡ New WebSocket connection request received")
	
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		log.Println("❌ WebSocket connection failed: Missing user_id")
		http.Error(w, "Missing user_id in query params", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Println("❌ WebSocket connection failed: Invalid user_id:", userIDStr)
		http.Error(w, "Invalid user_id", http.StatusBadRequest)
		return
	}
	
	log.Printf("✅ Attempting WebSocket upgrade for user_id: %d\n", userID)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}

	client := &hub.Client{
		UserID: uint(userID),
		Conn:   conn,
		Send:   make(chan []byte),
	}

	hub.H.HubRegister <- client

	// Start reading and writing
	go client.WriteMessages()
	client.ReadMessages()
}
