package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"chatapp/config"
	"chatapp/hub"
	"chatapp/routes"
)

func main() {
	// ✅ Step 0: Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// ✅ Step 1: Connect to the database
	config.ConnectDB()

	// ✅ Step 2: Start WebSocket hub (runs forever in background)
	go hub.H.Run()

	// ✅ Step 3: Create a new router (like Express app)
	mux := http.NewServeMux()

	// ✅ Step 4: Register all routes
	log.Println("🚀 Registering routes...")
	routes.AuthRoutes(mux)
	routes.ChatRoutes(mux)         // REST APIs (chat list, etc.)
	routes.RegisterChatRoutes(mux) // WebSocket route (/ws)
	log.Println("✅ Routes registered successfully")

	// ✅ Step 5: Configure proper CORS (for React frontend)
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // your React app URL
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Upgrade", "Connection"},
	})

	// ✅ Wrap your mux with CORS
	handler := c.Handler(mux)

	// ✅ Step 6: Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Server running at http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
