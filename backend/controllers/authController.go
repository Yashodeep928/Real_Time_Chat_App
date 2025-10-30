package controllers

import (
    "encoding/json"
    "net/http"
    "chatapp/config"
    "chatapp/models"
    "chatapp/utils"
)

func Signup(w http.ResponseWriter, r *http.Request) {
    var user models.User

    // 1. Decode JSON body from frontend
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // 2. Validate required fields
    if user.Username == "" || user.Email == "" || user.Password == "" {
        http.Error(w, "All fields are required", http.StatusBadRequest)
        return
    }

    // 3. Hash password
    hashedPassword, err := utils.HashPassword(user.Password)
    if err != nil {
        http.Error(w, "Error hashing password", http.StatusInternalServerError)
        return
    }
    user.Password = hashedPassword

    // 4. Save user to database
    if err := config.DB.Create(&user).Error; err != nil {
        http.Error(w, "User already exists or DB error", http.StatusConflict)
        return
    }

    // 5. Generate JWT token
    token, err := utils.CreateToken(int(user.ID), user.Email)
    if err != nil {
        http.Error(w, "Error creating token", http.StatusInternalServerError)
        return
    }

    // 6. Return response with token
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "User registered successfully",
        "token":   token,
        "user_id": user.ID,
    })
}

func Login(w http.ResponseWriter, r *http.Request) {
    var input struct {
        Username    string `json:"username"`
        Password string `json:"password"`
    }

    var dbUser models.User

    // 1. Decode JSON body
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // 2. Find user by username
    if err := config.DB.Where("username = ?", input.Username).First(&dbUser).Error; err != nil {
        http.Error(w, "User not found", http.StatusUnauthorized)
        return
    }

    // 3. Compare password
    if !utils.CheckPasswordHash(input.Password, dbUser.Password) {
        http.Error(w, "Invalid password", http.StatusUnauthorized)
        return
    }

    // 4. Generate JWT token
    token, err := utils.CreateToken(int(dbUser.ID), dbUser.Username)
    if err != nil {
        http.Error(w, "Error creating token", http.StatusInternalServerError)
        return
    }

    // 5. Return token + user ID
    json.NewEncoder(w).Encode(map[string]interface{}{
        "token":   token,
        "user_id": dbUser.ID,
    })
}
