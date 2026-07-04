package main

import (
	"log"

	"github.com/joho/godotenv"
	"seapedia/internal/db"
)

func main() {
	godotenv.Load()
	db.Connect()
	err := db.DB.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_id BIGINT;").Error
	if err != nil {
		log.Fatalf("Failed to add column: %v", err)
	}
	log.Println("Successfully added promo_id column to orders table!")
}
