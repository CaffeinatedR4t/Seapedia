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

// @Summary ListAvailableOrders
// @Description ListAvailableOrders
// @Tags driver_order
// @Router /api/v1/driver/orders/available [get]
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

// @Summary ListActiveOrders
// @Description ListActiveOrders
// @Tags driver_order
// @Router /api/v1/driver/orders/active [get]
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

// @Summary PickupOrder
// @Description PickupOrder
// @Tags driver_order
// @Router /api/v1/driver/orders/{id}/pickup [put]
func PickupOrder(c *gin.Context) {
	claims := middleware.GetClaims(c)
	id := c.Param("id")

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var job models.DeliveryJob
		if err := tx.Where("order_id = ?", id).First(&job).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		now := time.Now()
		res := tx.Model(&models.DeliveryJob{}).
			Where("order_id = ? AND status = ?", id, models.StatusMenungguPengirim).
			Updates(map[string]interface{}{
				"status":    models.StatusSedangDikirim,
				"driver_id": claims.UserID,
				"taken_at":  now,
			})
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return gorm.ErrInvalidData
		}

		if err := tx.Model(&models.Order{}).Where("id = ?", id).Updates(map[string]interface{}{
			"current_status": models.StatusSedangDikirim,
			"driver_id":      claims.UserID,
		}).Error; err != nil {
			return err
		}

		history := models.OrderStatusHistory{
			OrderID: job.OrderID,
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

// @Summary FinishOrder
// @Description FinishOrder
// @Tags driver_order
// @Router /api/v1/driver/orders/{id}/finish [put]
func FinishOrder(c *gin.Context) {
	claims := middleware.GetClaims(c)
	id := c.Param("id")

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var job models.DeliveryJob
		if err := tx.Where("order_id = ? AND driver_id = ?", id, claims.UserID).First(&job).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		now := time.Now()
		res := tx.Model(&models.DeliveryJob{}).
			Where("order_id = ? AND driver_id = ? AND status = ?", id, claims.UserID, models.StatusSedangDikirim).
			Updates(map[string]interface{}{
				"status":       models.StatusPesananSelesai,
				"completed_at": now,
			})
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return gorm.ErrInvalidData
		}

		if err := tx.Model(&models.Order{}).Where("id = ?", id).Update("current_status", models.StatusPesananSelesai).Error; err != nil {
			return err
		}

		history := models.OrderStatusHistory{
			OrderID: job.OrderID,
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

// @Summary DriverEarnings
// @Description DriverEarnings
// @Tags driver_order
// @Router /api/v1/driver/earnings [get]
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

// @Summary JobHistory
// @Description JobHistory
// @Tags driver_order
// @Router /api/v1/driver/orders/history [get]
func JobHistory(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var jobs []models.DeliveryJob
	db.DB.Preload("Order.Store").Where("driver_id = ? AND status = ?", claims.UserID, models.StatusPesananSelesai).Order("completed_at desc").Find(&jobs)
	
	res := make([]gin.H, len(jobs))
	for i, j := range jobs {
		res[i] = gin.H{
			"id":              j.Order.ID,
			"created_at":      j.Order.CreatedAt,
			"completed_at":    j.CompletedAt,
			"delivery_method": j.Order.DeliveryMethod,
			"store_name":      j.Order.Store.Name,
			"delivery_fee":    j.Order.DeliveryFee,
		}
	}
	if len(jobs) == 0 {
		res = []gin.H{}
	}
	c.JSON(http.StatusOK, res)
}
