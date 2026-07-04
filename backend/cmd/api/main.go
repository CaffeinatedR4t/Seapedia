package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"seapedia/internal/db"
	"seapedia/internal/models"
	"seapedia/internal/router"
)

// @title           SEAPEDIA API
// @version         1.0
// @description     Multi-role marketplace API — COMPFEST 18
// @host            localhost:8080
// @BasePath        /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading env from system")
	}

	db.Connect()

	// Auto-migrate the database schemas
	db.DB.AutoMigrate(
		&models.User{},
		&models.UserRole{},
		&models.Store{},
		&models.Product{},
		&models.Cart{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.OrderStatusHistory{},
		&models.Wallet{},
		&models.WalletTransaction{},
		&models.Address{},
		&models.Voucher{},
		&models.Promo{},
		&models.DeliveryJob{},
		&models.AppReview{},
	)

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "seapedia-api"})
	})

	router.Setup(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("SEAPEDIA API starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
