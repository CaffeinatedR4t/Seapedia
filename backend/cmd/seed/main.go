package main

import (
	"log"

	"github.com/joho/godotenv"
)

// Seed creates demo accounts for every role so every level can be demonstrated
// immediately after running:
//
//	go run cmd/seed/main.go
//
// Accounts seeded:
//   - admin     / admin123
//   - seller1   / seller123  (store: "Toko Satu")
//   - seller2   / seller123  (store: "Toko Dua")
//   - buyer1    / buyer123   (wallet: Rp 500.000)
//   - buyer2    / buyer123   (wallet: Rp 250.000)
//   - driver1   / driver123
func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	log.Println("TODO: connect DB and seed demo accounts")
	// DB connection + seeding logic will be added in the models/migrations step
}
