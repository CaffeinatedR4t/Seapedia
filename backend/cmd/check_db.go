
package main

import (
	"log"
	"seapedia/internal/db"
	"seapedia/internal/models"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}
	db.Connect()

	var users []models.User
	db.DB.Find(&users)
	for _, u := range users {
		log.Printf("User: %s (ID: %d)", u.Username, u.ID)
	}
	
	var products []models.Product
	db.DB.Find(&products)
	for _, p := range products {
		log.Printf("Product: %s (ID: %d, StoreID: %d)", p.Name, p.ID, p.StoreID)
	}
}
