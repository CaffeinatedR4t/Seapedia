package main

import (
	"log"

	"golang.org/x/crypto/bcrypt"
	"seapedia/internal/db"
	"seapedia/internal/models"
)

func main() {
	db.Connect()

	// Clear out existing data for a fresh seed (be careful on production, this is just for demo)
	db.DB.Exec("TRUNCATE TABLE users, user_roles, stores, products, wallets, addresses CASCADE")

	hashPassword := func(pw string) string {
		hash, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		return string(hash)
	}

	// 1. Admin
	admin := models.User{Username: "admin", PasswordHash: hashPassword("password")}
	db.DB.Create(&admin)
	db.DB.Create(&models.UserRole{UserID: admin.ID, Role: "admin"})

	// 2. Seller 1
	seller1 := models.User{Username: "seller1", PasswordHash: hashPassword("password")}
	db.DB.Create(&seller1)
	db.DB.Create(&models.UserRole{UserID: seller1.ID, Role: "seller"})

	store1 := models.Store{SellerID: seller1.ID, Name: "Ocean Gear", Description: "Toko Alat Selam Terbaik"}
	db.DB.Create(&store1)

	db.DB.Create(&models.Product{StoreID: store1.ID, Name: "Fins", Description: "Fins renang", Price: 150000, Stock: 50, ImageURL: "https://images.unsplash.com/photo-1544551763-46a013bb70d5"})

	// 3. Seller 2
	seller2 := models.User{Username: "seller2", PasswordHash: hashPassword("password")}
	db.DB.Create(&seller2)
	db.DB.Create(&models.UserRole{UserID: seller2.ID, Role: "seller"})
	
	store2 := models.Store{SellerID: seller2.ID, Name: "Seafood Fresh", Description: "Toko Ikan Segar"}
	db.DB.Create(&store2)
	db.DB.Create(&models.Product{StoreID: store2.ID, Name: "Ikan Tuna", Description: "1kg Tuna segar", Price: 80000, Stock: 10, ImageURL: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62"})

	// 4. Buyer 1
	buyer1 := models.User{Username: "buyer1", PasswordHash: hashPassword("password")}
	db.DB.Create(&buyer1)
	db.DB.Create(&models.UserRole{UserID: buyer1.ID, Role: "buyer"})
	
	db.DB.Create(&models.Wallet{BuyerID: buyer1.ID, Balance: 1000000})
	db.DB.Create(&models.Address{BuyerID: buyer1.ID, Label: "Rumah", FullAddress: "Jl. Pantai Indah No 1"})

	// 5. Buyer 2
	buyer2 := models.User{Username: "buyer2", PasswordHash: hashPassword("password")}
	db.DB.Create(&buyer2)
	db.DB.Create(&models.UserRole{UserID: buyer2.ID, Role: "buyer"})
	
	db.DB.Create(&models.Wallet{BuyerID: buyer2.ID, Balance: 50000})
	db.DB.Create(&models.Address{BuyerID: buyer2.ID, Label: "Kantor", FullAddress: "Menara Bahari Lt 12"})

	// 6. Driver
	driver := models.User{Username: "driver1", PasswordHash: hashPassword("password")}
	db.DB.Create(&driver)
	db.DB.Create(&models.UserRole{UserID: driver.ID, Role: "driver"})

	log.Println("✅ Database seeded successfully!")
	log.Println("Users created: admin, seller1, seller2, buyer1, buyer2, driver1. Password: 'password'")
}
