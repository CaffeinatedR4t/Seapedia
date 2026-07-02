package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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

	r := gin.Default()

	// Health-check — used by deployment platforms & CI
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "seapedia-api"})
	})

	// API v1 group — routes will be registered here by each handler package
	v1 := r.Group("/api/v1")
	_ = v1 // placeholder until handlers are wired up

	log.Println("SEAPEDIA API starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
