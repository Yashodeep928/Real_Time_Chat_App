package controllers

import (
	"chatapp/service"
	"chatapp/utils"
	"encoding/json"
	"net/http"
	"strconv"
)

var messageService = service.NewMessageService()

// GetChatMessages returns all messages between two users
func GetChatMessages(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from token
	currentUserID, err := utils.ExtractUserIDFromRequest(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get other user's ID from query parameter
	otherUserID := r.URL.Query().Get("user_id")
	if otherUserID == "" {
		http.Error(w, "Missing user_id parameter", http.StatusBadRequest)
		return
	}

	otherID, err := strconv.ParseUint(otherUserID, 10, 32)
	if err != nil {
		http.Error(w, "Invalid user_id", http.StatusBadRequest)
		return
	}

	messages, err := messageService.GetMessagesBetweenUsers(uint(currentUserID), uint(otherID))
	if err != nil {
		http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}