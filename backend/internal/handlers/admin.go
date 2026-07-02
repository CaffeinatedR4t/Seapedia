package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/models"
)

func SimulateOverdue(c *gin.Context) {
	// Find orders with status 'Menunggu Pengirim' updated more than 3 days ago.
	// For simulation purposes, we will find ANY order with 'Menunggu Pengirim' 
	// and force them to 'Dikembalikan' to demonstrate the logic.
	// To make it more realistic but testable, we'll process all 'Menunggu Pengirim'.

	var orders []models.Order
	db.DB.Where("current_status = ?", models.StatusMenungguPengirim).Find(&orders)

	processed := 0

	for _, order := range orders {
		err := db.DB.Transaction(func(tx *gorm.DB) error {
			// Update status
			order.CurrentStatus = models.StatusDikembalikan
			order.UpdatedAt = time.Now()
			if err := tx.Save(&order).Error; err != nil {
				return err
			}

			// Add history
			history := models.OrderStatusHistory{
				OrderID: order.ID,
				Status:  models.StatusDikembalikan,
			}
			if err := tx.Create(&history).Error; err != nil {
				return err
			}

			// Refund wallet
			var wallet models.Wallet
			if err := tx.Where("buyer_id = ?", order.BuyerID).First(&wallet).Error; err == nil {
				wallet.Balance += order.Total
				if err := tx.Save(&wallet).Error; err != nil {
					return err
				}

				walletTx := models.WalletTransaction{
					WalletID: wallet.ID,
					Type:     models.WalletTxRefund,
					Amount:   order.Total,
					OrderID:  &order.ID,
				}
				if err := tx.Create(&walletTx).Error; err != nil {
					return err
				}
			}

			return nil
		})

		if err == nil {
			processed++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Simulasi pembatalan otomatis selesai",
		"processed": processed,
	})
}
