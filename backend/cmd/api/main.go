package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"seapedia/internal/db"
)

// @title           SEAPEDIA API
// @version         1.0
// @description     Multi-role marketplace API — COMPFEST 18 Software Engineering Academy
// @host            localhost:8080
// @BasePath        /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Load .env (ignore error in production where env vars are set externally)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading env from system")
	}

	// Connect to PostgreSQL and run migrations
	db.Connect()
	db.Migrate()

	r := gin.Default()

	// Health-check — used by deployment platforms & CI
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "seapedia-api"})
	})

	// API v1 group — routes will be registered here by each handler package
	v1 := r.Group("/api/v1")
	_ = v1 // placeholder until handlers are wired up

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("SEAPEDIA API starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
