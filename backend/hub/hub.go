package hub

import (
	"chatapp/models"
	"chatapp/service"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// ---------------------- Structs ----------------------

type Message struct {
	ID         uint   `json:"id"`
	SenderID   uint   `json:"sender_id"`
	ReceiverID uint   `json:"receiver_id"`
	Content    string `json:"content"`
	RoomID     string `json:"room_id"`
}

type Client struct {
	UserID uint
	Conn   *websocket.Conn
	Send   chan []byte
}

// Hub manages all active WebSocket clients
type Hub struct {
	Clients        map[uint]*Client
	HubRegister    chan *Client
	HubUnregister  chan *Client
	Broadcast      chan []byte
	mu             sync.Mutex
	messageService *service.MessageService
}

// ---------------------- Global Hub ----------------------

var H = Hub{
	Clients:        make(map[uint]*Client),
	HubRegister:    make(chan *Client),
	HubUnregister:  make(chan *Client),
	Broadcast:      make(chan []byte),
	messageService: service.NewMessageService(),
}

// ---------------------- Hub Runner ----------------------

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.HubRegister:
			h.mu.Lock()
			h.Clients[client.UserID] = client
			h.mu.Unlock()
			log.Printf("✅ User %d connected", client.UserID)

		case client := <-h.HubUnregister:
			h.mu.Lock()
			if _, ok := h.Clients[client.UserID]; ok {
				delete(h.Clients, client.UserID)
				close(client.Send)
				log.Printf("❌ User %d disconnected", client.UserID)
			}
			h.mu.Unlock()

		case message := <-h.Broadcast:
			// Message will contain the JSON of Message struct
			var msg Message
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Println("Invalid message JSON:", err)
				continue
			}

			// Validate message data
			if msg.SenderID == 0 || msg.ReceiverID == 0 {
				log.Printf("Invalid sender_id or receiver_id: sender=%d, receiver=%d", msg.SenderID, msg.ReceiverID)
				continue
			}

			// Prevent self-messaging
			if msg.SenderID == msg.ReceiverID {
				log.Printf("Self-messaging attempt detected: user=%d", msg.SenderID)
				continue
			}

			// Validate that sender is actually connected
			if _, senderConnected := h.Clients[msg.SenderID]; !senderConnected {
				log.Printf("Message from non-connected sender: %d", msg.SenderID)
				continue
			}

			if msg.Content == "" {
				log.Println("Empty message content")
				continue
			}

			// Create and save message to database
			dbMessage := &models.Message{
				SenderID:   msg.SenderID,
				ReceiverID: msg.ReceiverID,
				Content:    msg.Content,
				RoomID:     msg.RoomID,
				CreatedAt:  time.Now(),
			}
			
			// Log the message being saved
			log.Printf("Saving message: sender=%d, receiver=%d, content=%s", 
				dbMessage.SenderID, dbMessage.ReceiverID, dbMessage.Content)
			
			if err := h.messageService.SaveMessage(dbMessage); err != nil {
				log.Printf("Failed to save message to database: %v", err)
				continue
			}

			// Create updated message with the database ID
			messageWithID := Message{
				ID:         dbMessage.ID,
				SenderID:   msg.SenderID,
				ReceiverID: msg.ReceiverID,
				Content:    msg.Content,
				RoomID:     msg.RoomID,
			}
			updatedMessage, _ := json.Marshal(messageWithID)

			h.mu.Lock()
			// Send only to receiver
			if receiver, ok := h.Clients[msg.ReceiverID]; ok {
				select {
				case receiver.Send <- updatedMessage:
					log.Printf("Message sent to receiver %d", msg.ReceiverID)
				default:
					log.Printf("Failed to send message to receiver %d", msg.ReceiverID)
				}
			}
			
			// Only send confirmation back to sender if the receiver is not connected
			// This prevents duplicate messages when both users are connected
			if _, receiverConnected := h.Clients[msg.ReceiverID]; !receiverConnected {
				if sender, ok := h.Clients[msg.SenderID]; ok {
					select {
					case sender.Send <- updatedMessage:
						log.Printf("Message confirmation sent to sender %d (receiver offline)", msg.SenderID)
					default:
						log.Printf("Failed to send confirmation to sender %d", msg.SenderID)
					}
				}
			}
			h.mu.Unlock()
			
			// Log message routing
			log.Printf("Message routed - Sender: %d, Receiver: %d, Content: %s", 
				msg.SenderID, msg.ReceiverID, msg.Content)
		}
	}
}

// ---------------------- Client Methods ----------------------

func (c *Client) ReadMessages() {
	defer func() {
		H.HubUnregister <- c
		c.Conn.Close()
	}()

	for {
		_, data, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		// Each message sent from frontend should be in JSON format
		H.Broadcast <- data
	}
}

func (c *Client) WriteMessages() {
	defer c.Conn.Close()

	for msg := range c.Send {
		err := c.Conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("Write error:", err)
			break
		}
	}
}
