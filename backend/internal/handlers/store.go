package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type StoreRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description" binding:"max=500"`
}

// @Summary CreateStore
// @Description CreateStore
// @Tags store
// @Router /api/v1/seller/store [post]
func CreateStore(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var req StoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existing models.Store
	if err := db.DB.Where("name = ?", req.Name).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "nama toko sudah digunakan"})
		return
	}

	if err := db.DB.Where("seller_id = ?", claims.UserID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "anda sudah memiliki toko"})
		return
	}

	store := models.Store{
		SellerID:    claims.UserID,
		Name:        req.Name,
		Description: req.Description,
	}

	if err := db.DB.Create(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat toko"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": store.ID, "name": store.Name, "description": store.Description})
}

// @Summary GetMyStore
// @Description GetMyStore
// @Tags store
// @Router /api/v1/seller/store [get]
func GetMyStore(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var store models.Store
	if err := db.DB.Where("seller_id = ?", claims.UserID).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "toko tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": store.ID, "name": store.Name, "description": store.Description})
}

// @Summary UpdateStore
// @Description UpdateStore
// @Tags store
// @Router /api/v1/seller/store [put]
func UpdateStore(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var req StoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var store models.Store
	if err := db.DB.Where("seller_id = ?", claims.UserID).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "toko tidak ditemukan"})
		return
	}

	if store.Name != req.Name {
		var existing models.Store
		if err := db.DB.Where("name = ?", req.Name).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "nama toko sudah digunakan"})
			return
		}
	}

	store.Name = req.Name
	store.Description = req.Description

	if err := db.DB.Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memperbarui toko"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": store.ID, "name": store.Name, "description": store.Description})
}

// @Summary GetStore
// @Description GetStore
// @Tags store
// @Router /api/v1/stores/{id} [get]
func GetStore(c *gin.Context) {
	id := c.Param("id")
	var store models.Store
	if err := db.DB.Preload("Products").First(&store, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "toko tidak ditemukan"})
		return
	}

	products := make([]gin.H, len(store.Products))
	for i, p := range store.Products {
		products[i] = productToJSON(p) // defined in product.go
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          store.ID,
		"name":        store.Name,
		"description": store.Description,
		"products":    products,
	})
}

func getMyStoreOrAbort(c *gin.Context, userID uint) (*models.Store, bool) {
	var store models.Store
	if err := db.DB.Where("seller_id = ?", userID).First(&store).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "anda belum membuat profil toko"})
		return nil, false
	}
	return &store, true
}
