package service

import (
	"chatapp/config"
	"chatapp/models"
)

// MessageService handles message-related database operations
type MessageService struct{}

// SaveMessage saves a new message to the database
func (s *MessageService) SaveMessage(message *models.Message) error {
	result := config.DB.Create(message)
	return result.Error
}

// GetMessagesBetweenUsers retrieves all messages between two users
func (s *MessageService) GetMessagesBetweenUsers(userID1, userID2 uint) ([]models.Message, error) {
	var messages []models.Message
	result := config.DB.Where(
		"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		userID1, userID2, userID2, userID1,
	).Order("created_at ASC").Find(&messages)

	return messages, result.Error
}

// NewMessageService creates a new instance of MessageService
func NewMessageService() *MessageService {
	return &MessageService{}
}