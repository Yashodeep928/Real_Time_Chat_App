package routes

import (
	"net/http"
	"chatapp/controllers"
	"chatapp/middleware" // ✅ Correct import alias
)

// ✅ ChatRoutes — All chat-related routes (protected)
func ChatRoutes(mux *http.ServeMux) {
	mux.Handle("/api/chats", middleware.AuthMiddleware(http.HandlerFunc(controllers.GetChatListHandler)))
	mux.Handle("/api/messages", middleware.AuthMiddleware(http.HandlerFunc(controllers.GetChatMessages)))
}

// ✅ RegisterChatRoutes — WebSocket route (no middleware)
func RegisterChatRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/ws", HandleWebSocket)
}
