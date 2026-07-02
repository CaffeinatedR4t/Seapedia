package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"seapedia/internal/db"
	"seapedia/internal/models"
)

func ListProducts(c *gin.Context) {
	var products []models.Product
	if err := db.DB.Preload("Store").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil produk"})
		return
	}
	resp := make([]gin.H, len(products))
	for i, p := range products {
		resp[i] = productToJSON(p)
	}
	if len(products) == 0 {
		resp = []gin.H{}
	}
	c.JSON(http.StatusOK, resp)
}

func GetProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id produk tidak valid"})
		return
	}
	var product models.Product
	if err := db.DB.Preload("Store").First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "produk tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, productToJSON(product))
}

func productToJSON(p models.Product) gin.H {
	storeInfo := gin.H{"id": 0, "name": "Toko Tidak Dikenal"}
	if p.Store.ID != 0 {
		storeInfo = gin.H{"id": p.Store.ID, "name": p.Store.Name}
	}
	return gin.H{
		"id":          p.ID,
		"name":        p.Name,
		"description": p.Description,
		"price":       p.Price,
		"stock":       p.Stock,
		"image_url":   p.ImageURL,
		"store":       storeInfo,
	}
}
