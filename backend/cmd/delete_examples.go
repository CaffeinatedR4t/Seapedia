
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

	usernames := []string{"seller1", "seller2"}

	for _, username := range usernames {
		var user models.User
		if err := db.DB.Where("username = ?", username).First(&user).Error; err == nil {
			log.Printf("Deleting example user: %s (ID: %d)", user.Username, user.ID)
			
			// Delete related products
			var store models.Store
			if err := db.DB.Where("seller_id = ?", user.ID).First(&store).Error; err == nil {
				db.DB.Unscoped().Where("store_id = ?", store.ID).Delete(&models.Product{})
				db.DB.Unscoped().Delete(&store)
			}
			
			// Delete roles
			db.DB.Unscoped().Where("user_id = ?", user.ID).Delete(&models.UserRole{})
			
			// Delete user
			db.DB.Unscoped().Delete(&user)
		}
	}
	log.Println("Successfully removed all example products and stores!")
}

