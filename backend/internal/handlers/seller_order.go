package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

func UpdateSellerOrderStatus(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	id := c.Param("id")
	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Status != string(models.StatusMenungguPengirim) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status tidak diizinkan"})
		return
	}

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var order models.Order
		if err := tx.Where("id = ? AND store_id = ?", id, store.ID).First(&order).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if order.CurrentStatus != models.StatusSedangDikemas {
			return gorm.ErrInvalidData
		}

		order.CurrentStatus = models.StatusMenungguPengirim
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		history := models.OrderStatusHistory{
			OrderID: order.ID,
			Status:  models.StatusMenungguPengirim,
		}
		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "pesanan tidak ditemukan"})
		} else if err == gorm.ErrInvalidData {
			c.JSON(http.StatusBadRequest, gin.H{"error": "status pesanan tidak valid untuk diubah"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memperbarui status"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "status pesanan diperbarui"})
}
