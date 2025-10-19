package routes

import (
	"net/http"

	"chatapp/controllers"
)

func WebSocketRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/ws", controllers.HandleWS)
}
