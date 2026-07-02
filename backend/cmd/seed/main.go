package main

import (
	"log"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/models"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	db.Connect()
	db.Migrate()

	// Seed demo accounts — idempotent (skip if already exists)
	seedUser("admin", "admin123", []string{"admin"})
	seedUser("seller1", "seller123", []string{"seller"})
	seedUser("seller2", "seller123", []string{"seller"})
	seedBuyer("buyer1", "buyer123", 500000)
	seedBuyer("buyer2", "buyer123", 250000)
	seedUser("driver1", "driver123", []string{"driver"})

	seedStoreAndProducts()

	log.Println("Seed completed successfully!")
	log.Println("Demo accounts: admin/admin123, seller1/seller123, seller2/seller123, buyer1/buyer123, buyer2/buyer123, driver1/driver123")
}

func seedUser(username, password string, roles []string) {
	var existing models.User
	if err := db.DB.Where("username = ?", username).First(&existing).Error; err == nil {
		log.Printf("[skip] user %q already exists", username)
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		log.Fatalf("bcrypt failed for %s: %v", username, err)
	}
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		user := models.User{Username: username, PasswordHash: string(hash)}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		for _, r := range roles {
			if err := tx.Create(&models.UserRole{UserID: user.ID, Role: models.RoleName(r)}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		log.Fatalf("failed to seed user %s: %v", username, err)
	}
	log.Printf("[created] user %q with roles %v", username, roles)
}

func seedBuyer(username, password string, initialBalance float64) {
	var existing models.User
	if err := db.DB.Where("username = ?", username).First(&existing).Error; err == nil {
		log.Printf("[skip] user %q already exists", username)
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		log.Fatalf("bcrypt failed for %s: %v", username, err)
	}
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		user := models.User{Username: username, PasswordHash: string(hash)}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		if err := tx.Create(&models.UserRole{UserID: user.ID, Role: models.RoleBuyer}).Error; err != nil {
			return err
		}
		wallet := models.Wallet{BuyerID: user.ID, Balance: initialBalance}
		if err := tx.Create(&wallet).Error; err != nil {
			return err
		}
		tx.Create(&models.WalletTransaction{
			WalletID: wallet.ID, Type: models.WalletTxTopup, Amount: initialBalance,
		})
		return nil
	})
	if err != nil {
		log.Fatalf("failed to seed buyer %s: %v", username, err)
	}
	log.Printf("[created] buyer %q with wallet Rp %.0f", username, initialBalance)
}

func seedStoreAndProducts() {
	var seller1 models.User
	if err := db.DB.Where("username = ?", "seller1").First(&seller1).Error; err != nil {
		return
	}

	var store1 models.Store
	if err := db.DB.Where("seller_id = ?", seller1.ID).First(&store1).Error; err != nil {
		store1 = models.Store{SellerID: seller1.ID, Name: "Toko Selam Indo", Description: "Pusat peralatan selam terlengkap di Indonesia."}
		db.DB.Create(&store1)
		db.DB.Create(&models.Product{StoreID: store1.ID, Name: "Snorkeling Set Premium", Description: "Set snorkeling lengkap dengan masker, fins, dan dry bag. Cocok untuk petualangan bawah laut.", Price: 350000, Stock: 15, ImageURL: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500"})
		db.DB.Create(&models.Product{StoreID: store1.ID, Name: "Action Cam Waterproof", Description: "Kamera aksi tahan air hingga 30m kedalaman. Rekam petualangan laut Anda!", Price: 850000, Stock: 8, ImageURL: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500"})
	}

	var seller2 models.User
	if err := db.DB.Where("username = ?", "seller2").First(&seller2).Error; err != nil {
		return
	}

	var store2 models.Store
	if err := db.DB.Where("seller_id = ?", seller2.ID).First(&store2).Error; err != nil {
		store2 = models.Store{SellerID: seller2.ID, Name: "Ocean Fashion", Description: "Fashion pantai terbaik untuk liburanmu."}
		db.DB.Create(&store2)
		db.DB.Create(&models.Product{StoreID: store2.ID, Name: "Kaos Pantai Tropis", Description: "Kaos pantai motif ikan tropis, bahan cotton breathable.", Price: 120000, Stock: 50, ImageURL: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500"})
		db.DB.Create(&models.Product{StoreID: store2.ID, Name: "Topi Pantai Wide Brim", Description: "Topi pantai jerami, UV protection SPF50+.", Price: 95000, Stock: 30, ImageURL: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500"})
	}
}
