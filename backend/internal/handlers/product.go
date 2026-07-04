package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

// @Summary ListProducts
// @Description ListProducts
// @Tags product
// @Router /api/v1/products [get]
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

// @Summary GetProduct
// @Description GetProduct
// @Tags product
// @Router /api/v1/products/{id} [get]
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

// @Summary ListMyProducts
// @Description ListMyProducts
// @Tags product
// @Router /api/v1/seller/products [get]
func ListMyProducts(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var store models.Store
	if err := db.DB.Where("seller_id = ?", claims.UserID).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "toko tidak ditemukan"})
		return
	}

	var products []models.Product
	if err := db.DB.Where("store_id = ?", store.ID).Preload("Store").Find(&products).Error; err != nil {
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

type ProductReq struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Stock       int     `json:"stock" binding:"required,min=0"`
	ImageURL    string  `json:"image_url"`
}

// @Summary CreateProduct
// @Description CreateProduct
// @Tags product
// @Router /api/v1/seller/products [post]
func CreateProduct(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var store models.Store
	if err := db.DB.Where("seller_id = ?", claims.UserID).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "toko tidak ditemukan"})
		return
	}

	var req ProductReq
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

	db.DB.Preload("Store").First(&product, product.ID)
	c.JSON(http.StatusCreated, productToJSON(product))
}

// @Summary UpdateProduct
// @Description UpdateProduct
// @Tags product
// @Router /api/v1/seller/products/{id} [put]
func UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id produk tidak valid"})
		return
	}

	claims := middleware.GetClaims(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var store models.Store
	if err := db.DB.Where("seller_id = ?", claims.UserID).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "toko tidak ditemukan"})
		return
	}

	var product models.Product
	if err := db.DB.Where("id = ? AND store_id = ?", id, store.ID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "produk tidak ditemukan atau bukan milik anda"})
		return
	}

	var req ProductReq
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

	db.DB.Preload("Store").First(&product, product.ID)
	c.JSON(http.StatusOK, productToJSON(product))
}

// @Summary DeleteProduct
// @Description DeleteProduct
// @Tags product
// @Router /api/v1/seller/products/{id} [delete]
func DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id produk tidak valid"})
		return
	}

	claims := middleware.GetClaims(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var store models.Store
	if err := db.DB.Where("seller_id = ?", claims.UserID).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "toko tidak ditemukan"})
		return
	}

	var product models.Product
	if err := db.DB.Where("id = ? AND store_id = ?", id, store.ID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "produk tidak ditemukan atau bukan milik anda"})
		return
	}

	if err := db.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menghapus produk"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "produk berhasil dihapus"})
}
