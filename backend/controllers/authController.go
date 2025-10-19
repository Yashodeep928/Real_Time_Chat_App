package controllers

import (
	"encoding/json"
	"net/http"

	"chatapp/config"
	"chatapp/models"
	"chatapp/utils"
)

// Signup handles user registration
func Signup(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Validate fields
	if user.Username == "" || user.Email == "" || user.Password == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword

	// Save user
	if err := config.DB.Create(&user).Error; err != nil {
		http.Error(w, "User already exists or DB error", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})
}

// Login handles user login
func Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var dbUser models.User

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Find user by email
	if err := config.DB.Where("email = ?", input.Email).First(&dbUser).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Compare password
	if !utils.CheckPasswordHash(input.Password, dbUser.Password) {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Generate JWT
	token, err := utils.GenerateToken(dbUser.Email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
