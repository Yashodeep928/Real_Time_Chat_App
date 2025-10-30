package controllers

import (
	"encoding/json"
	"log"
	"net/http"

	"chatapp/config"
	"chatapp/hub"
	"chatapp/models"
	"chatapp/utils"

	"github.com/gorilla/websocket"
)

// ✅ WebSocket upgrader — upgrades HTTP -> WebSocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow requests from frontend (React)
		return true
	},
}

// ✅ HandleWebSocket — manages WebSocket connection for each user
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Step 1: Extract user ID from token
	userID, err := utils.ExtractUserIDFromRequest(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Step 2: Upgrade the HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("❌ WebSocket Upgrade error:", err)
		return
	}

	// Step 3: Create a new client
	client := &hub.Client{
		UserID: uint(userID), // ✅ FIX: Convert int → uint
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	// Step 4: Register client in the hub
	hub.H.HubRegister <- client

	// Step 5: Start reading & writing messages concurrently
	go client.ReadMessages()
	go client.WriteMessages()
}

// ✅ GetChatListHandler — returns the list of all users except the logged-in one
func GetChatListHandler(w http.ResponseWriter, r *http.Request) {
	// Step 1: Extract user ID from JWT
	userID, err := utils.ExtractUserIDFromRequest(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// ✅ Step 2: Fetch all users except the current one
	query := `
		SELECT 
			u.id AS user_id,
			u.username,
			u.email,
			'' AS last_message,
			NOW() AS last_time
		FROM users u
		WHERE u.id != ?
	`

	rows, err := config.DB.Raw(query, userID).Rows()
	if err != nil {
		http.Error(w, "Failed to fetch chat list", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var chatList []models.ChatListItem
	for rows.Next() {
		var item models.ChatListItem
		if err := rows.Scan(&item.UserID, &item.Username, &item.Email, &item.LastMessage, &item.LastTime); err != nil {
			http.Error(w, "Error reading chat list", http.StatusInternalServerError)
			return
		}
		chatList = append(chatList, item)
	}

	// Step 3: Send JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chatList)
}
