package models

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Username string `json:"username" gorm:"not null"`
	Email    string `json:"email" gorm:"unique;not null"`
	Password string `json:"password" gorm:"not null"`
}
