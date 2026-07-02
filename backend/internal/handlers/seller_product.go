package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type ProductRequest struct {
	Name        string  `json:"name" binding:"required,min=3,max=100"`
	Description string  `json:"description" binding:"max=1000"`
	Price       float64 `json:"price" binding:"required,min=0"`
	Stock       int     `json:"stock" binding:"min=0"`
	ImageURL    string  `json:"image_url"`
}

func getMyStoreOrAbort(c *gin.Context, userID uint) (*models.Store, bool) {
	var store models.Store
	if err := db.DB.Where("seller_id = ?", userID).First(&store).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "anda belum membuat profil toko"})
		return nil, false
	}
	return &store, true
}

func ListMyProducts(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	var products []models.Product
	db.DB.Where("store_id = ?", store.ID).Find(&products)
	
	resp := make([]gin.H, len(products))
	for i, p := range products {
		resp[i] = productToJSON(p)
	}
	if len(products) == 0 {
		resp = []gin.H{}
	}
	c.JSON(http.StatusOK, resp)
}

func CreateProduct(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product := models.Product{
		StoreID:     store.ID,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		ImageURL:    req.ImageURL,
	}

	if err := db.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat produk"})
		return
	}

	c.JSON(http.StatusCreated, productToJSON(product))
}

func UpdateProduct(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id produk tidak valid"})
		return
	}

	var product models.Product
	if err := db.DB.Where("store_id = ?", store.ID).First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "produk tidak ditemukan di toko anda"})
		return
	}

	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product.Name = req.Name
	product.Description = req.Description
	product.Price = req.Price
	product.Stock = req.Stock
	product.ImageURL = req.ImageURL

	if err := db.DB.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memperbarui produk"})
		return
	}

	c.JSON(http.StatusOK, productToJSON(product))
}

func DeleteProduct(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id produk tidak valid"})
		return
	}

	var product models.Product
	if err := db.DB.Where("store_id = ?", store.ID).First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "produk tidak ditemukan di toko anda"})
		return
	}

	if err := db.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menghapus produk"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "produk berhasil dihapus"})
}
