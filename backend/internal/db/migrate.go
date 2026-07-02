package db

import (
	"log"

	"seapedia/internal/models"
)

// Migrate runs GORM AutoMigrate for all models in dependency order.
// It is safe to run on every startup — GORM only creates missing tables/columns.
// It does NOT drop or rename existing columns (non-destructive).
func Migrate() {
	if DB == nil {
		log.Fatal("Migrate() called before Connect()")
	}

	err := DB.AutoMigrate(
		// Auth
		&models.User{},
		&models.UserRole{},

		// Store & Catalog
		&models.Store{},
		&models.Product{},

		// Cart
		&models.Cart{},
		&models.CartItem{},

		// Orders
		&models.Order{},
		&models.OrderItem{},
		&models.OrderStatusHistory{},

		// Wallet
		&models.Wallet{},
		&models.WalletTransaction{},

		// Address
		&models.Address{},

		// Discounts
		&models.Voucher{},
		&models.Promo{},

		// Delivery
		&models.DeliveryJob{},

		// Reviews
		&models.AppReview{},
	)
	if err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	log.Println("Database migration completed")
}
