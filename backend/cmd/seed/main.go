package main

import (
	"log"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"seapedia/internal/db"
	"seapedia/internal/models"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

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

	db.DB.Create(&models.Product{StoreID: store1.ID, Name: "Fins", Description: "Fins renang", Price: 150000, Stock: 50, ImageURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn11.bigcommerce.com%2Fs-hwgrldcncv%2Fimages%2Fstencil%2Foriginal%2Fproducts%2F81666%2F160797%2Fi2fr2hYKBB9di7VxVA1GM3P3F5cXfFg0fuB2aXOlOORnetGQvCHuYECgPBPLGdcC__19430.1733409290.jpg&f=1&nofb=1&ipt=3705be244e6a96e31bd89acd79f60fbdbe6a2d6504572fd2cb26f031b9740f38"})

	// 3. Seller 2
	seller2 := models.User{Username: "seller2", PasswordHash: hashPassword("password")}
	db.DB.Create(&seller2)
	db.DB.Create(&models.UserRole{UserID: seller2.ID, Role: "seller"})
	
	store2 := models.Store{SellerID: seller2.ID, Name: "Seafood Fresh", Description: "Toko Ikan Segar"}
	db.DB.Create(&store2)
	db.DB.Create(&models.Product{StoreID: store2.ID, Name: "Ikan Tuna", Description: "1kg Tuna segar", Price: 80000, Stock: 10, ImageURL: "https://amazingfoodanddrink.com/wp-content/uploads/2025/03/Best-Ways-to-Cook-Tuna-Steaks-2-1536x1536.jpeg"})

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

	log.Println("Database seeded successfully!")
	log.Println("Users created: admin, seller1, seller2, buyer1, buyer2, driver1. Password: 'password'")
}
