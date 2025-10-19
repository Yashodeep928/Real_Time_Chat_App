package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors"

	"chatapp/config"
	"chatapp/routes"
)

func main() {
	// Initialize database connection
	config.ConnectDB()

	// Setup routes
	mux := http.NewServeMux()
	routes.AuthRoutes(mux)
	routes.WebSocketRoutes(mux)

	// Enable CORS for frontend
	handler := cors.AllowAll().Handler(mux)

	fmt.Println("🚀 Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
