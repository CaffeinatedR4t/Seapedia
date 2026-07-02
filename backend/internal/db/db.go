package db

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the package-level GORM database handle shared across the application.
var DB *gorm.DB

// Connect opens a connection to PostgreSQL (Supabase) using DATABASE_URL from env,
// configures connection pooling, and stores the handle in db.DB.
// It panics if the connection cannot be established — the app cannot run without a DB.
//
// Supabase requires sslmode=require. The DATABASE_URL must include this parameter.
// Example: postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require
func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback: build DSN from individual env vars (still enforces SSL for Supabase)
		sslmode := getenv("DB_SSLMODE", "require")
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			getenv("DB_HOST", "localhost"),
			getenv("DB_PORT", "5432"),
			getenv("DB_USER", "postgres"),
			getenv("DB_PASSWORD", ""),
			getenv("DB_NAME", "postgres"),
			sslmode,
		)
	}

	logLevel := logger.Silent
	if os.Getenv("GIN_MODE") != "release" {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB from GORM: %v", err)
	}

	// Connection pool settings
	// Supabase free tier has a limit of ~60 connections — keep pool small
	sqlDB.SetMaxIdleConns(3)
	sqlDB.SetMaxOpenConns(10)

	DB = db
	log.Println("Database connection established (Supabase PostgreSQL)")
}

// getenv returns the env var value or a default if not set.
func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
