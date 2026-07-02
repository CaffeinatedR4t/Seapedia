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

// Connect opens a connection to PostgreSQL using DATABASE_URL from env,
// configures connection pooling, and stores the handle in db.DB.
// It panics if the connection cannot be established — the app cannot run without a DB.
func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback: build DSN from individual env vars
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			getenv("DB_HOST", "localhost"),
			getenv("DB_PORT", "5432"),
			getenv("DB_USER", "seapedia"),
			getenv("DB_PASSWORD", "secret"),
			getenv("DB_NAME", "seapedia"),
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
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(25)

	DB = db
	log.Println("Database connection established")
}

// getenv returns the env var value or a default if not set.
func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
