package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

func ListAvailableOrders(c *gin.Context) {
	var jobs []models.DeliveryJob
	db.DB.Preload("Order.Store").Where("status = ?", models.StatusMenungguPengirim).Order("id asc").Find(&jobs)
	
	// Convert to JSON
	res := make([]gin.H, len(jobs))
	for i, j := range jobs {
		res[i] = gin.H{
			"id":              j.Order.ID, // Keep frontend using order_id
			"created_at":      j.Order.CreatedAt,
			"delivery_method": j.Order.DeliveryMethod,
			"store_name":      j.Order.Store.Name,
		}
	}
	if len(jobs) == 0 {
		res = []gin.H{}
	}
	c.JSON(http.StatusOK, res)
}

func ListActiveOrders(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var jobs []models.DeliveryJob
	db.DB.Preload("Order.Store").Where("driver_id = ? AND status = ?", claims.UserID, models.StatusSedangDikirim).Find(&jobs)
	
	res := make([]gin.H, len(jobs))
	for i, j := range jobs {
		res[i] = gin.H{
			"id":              j.Order.ID, // Keep frontend using order_id
			"created_at":      j.Order.CreatedAt,
			"delivery_method": j.Order.DeliveryMethod,
			"store_name":      j.Order.Store.Name,
		}
	}
	if len(jobs) == 0 {
		res = []gin.H{}
	}
	c.JSON(http.StatusOK, res)
}

func PickupOrder(c *gin.Context) {
	claims := middleware.GetClaims(c)
	id := c.Param("id")

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var job models.DeliveryJob
		if err := tx.Where("order_id = ?", id).First(&job).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if job.Status != models.StatusMenungguPengirim {
			return gorm.ErrInvalidData
		}

		var order models.Order
		if err := tx.First(&order, id).Error; err != nil {
			return err
		}

		now := time.Now()
		// Update job
		job.Status = models.StatusSedangDikirim
		job.DriverID = &claims.UserID
		job.TakenAt = &now
		if err := tx.Save(&job).Error; err != nil {
			return err
		}

		// Update order
		order.CurrentStatus = models.StatusSedangDikirim
		order.DriverID = &claims.UserID
		if err := tx.Save(&order).Error; err != nil {
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
		var job models.DeliveryJob
		if err := tx.Where("order_id = ? AND driver_id = ?", id, claims.UserID).First(&job).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if job.Status != models.StatusSedangDikirim {
			return gorm.ErrInvalidData
		}

		var order models.Order
		if err := tx.First(&order, id).Error; err != nil {
			return err
		}

		now := time.Now()
		job.Status = models.StatusPesananSelesai
		job.CompletedAt = &now
		if err := tx.Save(&job).Error; err != nil {
			return err
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

func DriverEarnings(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var jobs []models.DeliveryJob
	db.DB.Preload("Order").Where("driver_id = ? AND status = ?", claims.UserID, models.StatusPesananSelesai).Find(&jobs)
	
	totalEarnings := 0.0
	for _, j := range jobs {
		totalEarnings += j.Order.DeliveryFee
	}

	c.JSON(http.StatusOK, gin.H{
		"completed_jobs": len(jobs),
		"total_earnings": totalEarnings,
	})
}
