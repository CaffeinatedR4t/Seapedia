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
