package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

func ListAvailableOrders(c *gin.Context) {
	var orders []models.Order
	db.DB.Preload("Store").Where("current_status = ?", models.StatusMenungguPengirim).Order("updated_at asc").Find(&orders)
	c.JSON(http.StatusOK, mapOrdersToJSON(orders))
}

func ListActiveOrders(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var orders []models.Order
	// For simplicity, we track driver by adding DriverID to Order or checking status history?
	// Oh, does Order model have DriverID? Let me check.
	// If not, I will add it to the model.
	db.DB.Preload("Store").Where("driver_id = ? AND current_status = ?", claims.UserID, models.StatusSedangDikirim).Find(&orders)
	c.JSON(http.StatusOK, mapOrdersToJSON(orders))
}

func PickupOrder(c *gin.Context) {
	claims := middleware.GetClaims(c)
	id := c.Param("id")

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var order models.Order
		if err := tx.First(&order, id).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if order.CurrentStatus != models.StatusMenungguPengirim {
			return gorm.ErrInvalidData
		}

		// Update order
		order.CurrentStatus = models.StatusSedangDikirim
		// Assuming we add DriverID to order
		if err := tx.Model(&order).Updates(map[string]interface{}{
			"current_status": models.StatusSedangDikirim,
			"driver_id":      claims.UserID,
		}).Error; err != nil {
			return err
		}

		history := models.OrderStatusHistory{
			OrderID: order.ID,
			Status:  models.StatusSedangDikirim,
		}
		return tx.Create(&history).Error
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "pesanan tidak ditemukan"})
		} else if err == gorm.ErrInvalidData {
			c.JSON(http.StatusBadRequest, gin.H{"error": "pesanan tidak dapat diambil"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil pesanan"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "pesanan berhasil diambil"})
}

func FinishOrder(c *gin.Context) {
	claims := middleware.GetClaims(c)
	id := c.Param("id")

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var order models.Order
		if err := tx.Where("id = ? AND driver_id = ?", id, claims.UserID).First(&order).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if order.CurrentStatus != models.StatusSedangDikirim {
			return gorm.ErrInvalidData
		}

		order.CurrentStatus = models.StatusPesananSelesai
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		history := models.OrderStatusHistory{
			OrderID: order.ID,
			Status:  models.StatusPesananSelesai,
		}
		return tx.Create(&history).Error
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "pesanan tidak ditemukan atau bukan milik anda"})
		} else if err == gorm.ErrInvalidData {
			c.JSON(http.StatusBadRequest, gin.H{"error": "pesanan tidak dapat diselesaikan"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyelesaikan pesanan"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "pesanan selesai"})
}
