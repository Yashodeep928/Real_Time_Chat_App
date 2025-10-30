package models

import "time"

// ChatListItem represents one item in the chat list for a user
type ChatListItem struct {
	UserID      uint      `json:"user_id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	LastMessage string    `json:"last_message"`
	LastTime    time.Time `json:"last_time"`
}
