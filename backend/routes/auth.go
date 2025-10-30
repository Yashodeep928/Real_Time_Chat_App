package routes

import (
    "chatapp/controllers"
    "net/http"
)

func AuthRoutes(mux *http.ServeMux) {
    mux.HandleFunc("/api/signup", controllers.Signup)
    mux.HandleFunc("/api/login", controllers.Login)
}
