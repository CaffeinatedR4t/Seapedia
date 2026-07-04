
package main

import (
	"log"
	"seapedia/internal/db"
	"seapedia/internal/models"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}
	db.Connect()

	db.DB.Model(&models.Product{}).Where("name = ?", "Fins").Update("image_url", "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn11.bigcommerce.com%2Fs-hwgrldcncv%2Fimages%2Fstencil%2Foriginal%2Fproducts%2F81666%2F160797%2Fi2fr2hYKBB9di7VxVA1GM3P3F5cXfFg0fuB2aXOlOORnetGQvCHuYECgPBPLGdcC__19430.1733409290.jpg&f=1&nofb=1&ipt=3705be244e6a96e31bd89acd79f60fbdbe6a2d6504572fd2cb26f031b9740f38")
	db.DB.Model(&models.Product{}).Where("name = ?", "Ikan Tuna").Update("image_url", "https://amazingfoodanddrink.com/wp-content/uploads/2025/03/Best-Ways-to-Cook-Tuna-Steaks-2-1536x1536.jpeg")

	log.Println("Successfully updated product images in database!")
}

