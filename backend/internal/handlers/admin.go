package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/models"
)

type PromoRequest struct {
	Code         string `json:"code" binding:"required"`
	DiscountRule string `json:"discount_rule" binding:"required"`
}

func AdminStats(c *gin.Context) {
	var users, stores, products, orders, vouchers, promos, jobs int64
	db.DB.Model(&models.User{}).Count(&users)
	db.DB.Model(&models.Store{}).Count(&stores)
	db.DB.Model(&models.Product{}).Count(&products)
	db.DB.Model(&models.Order{}).Count(&orders)
	db.DB.Model(&models.DiscountVoucher{}).Count(&vouchers)
	db.DB.Model(&models.Promo{}).Count(&promos)
	db.DB.Model(&models.DeliveryJob{}).Count(&jobs)

	c.JSON(http.StatusOK, gin.H{
		"users":    users,
		"stores":   stores,
		"products": products,
		"orders":   orders,
		"vouchers": vouchers,
		"promos":   promos,
		"jobs":     jobs,
	})
}

func ListPromos(c *gin.Context) {
	var promos []models.Promo
	db.DB.Find(&promos)
	c.JSON(http.StatusOK, promos)
}

func CreatePromo(c *gin.Context) {
	var req PromoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	promo := models.Promo{
		Code:         req.Code,
		DiscountRule: req.DiscountRule,
		ExpiryDate:   time.Now().Add(30 * 24 * time.Hour), // 30 days
	}
	
	if err := db.DB.Create(&promo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat promo"})
		return
	}
	
	c.JSON(http.StatusCreated, promo)
}

func SimulateOverdue(c *gin.Context) {
	// SimulateOverdue fast-forwards time checking for SLAs.
	// We'll define SLA: Instant (1 day), Next Day (2 days), Regular (3 days).
	var orders []models.Order
	db.DB.Where("current_status = ?", models.StatusMenungguPengirim).Find(&orders)

	processed := 0
	now := time.Now()

	for _, order := range orders {
		// Calculate SLA limit
		slaDays := 3
		if order.DeliveryMethod == "Instant" {
			slaDays = 1
		} else if order.DeliveryMethod == "Next Day" {
			slaDays = 2
		}

		// For demonstration, if `force=true` is passed, we cancel everything.
		force := c.Query("force") == "true"
		
		// Real logic: if time.Since(order.UpdatedAt).Hours() > float64(slaDays*24)
		if !force && time.Since(order.UpdatedAt).Hours() <= float64(slaDays*24) {
			continue
		}

		err := db.DB.Transaction(func(tx *gorm.DB) error {
			// Idempotency check: Ensure order is STILL Menunggu Pengirim
			var checkOrder models.Order
			if err := tx.First(&checkOrder, order.ID).Error; err != nil {
				return err
			}
			if checkOrder.CurrentStatus != models.StatusMenungguPengirim {
				return nil // Already processed
			}

			// Update status
			checkOrder.CurrentStatus = models.StatusDikembalikan
			if err := tx.Save(&checkOrder).Error; err != nil {
				return err
			}

			// Add history
			history := models.OrderStatusHistory{
				OrderID: checkOrder.ID,
				Status:  models.StatusDikembalikan,
			}
			if err := tx.Create(&history).Error; err != nil {
				return err
			}

			// Restore stock
			var items []models.OrderItem
			if err := tx.Where("order_id = ?", checkOrder.ID).Find(&items).Error; err == nil {
				for _, item := range items {
					tx.Model(&models.Product{}).Where("id = ?", item.ProductID).UpdateColumn("stock", gorm.Expr("stock + ?", item.Quantity))
				}
			}

			// Refund wallet
			var wallet models.Wallet
			if err := tx.Where("buyer_id = ?", checkOrder.BuyerID).First(&wallet).Error; err == nil {
				wallet.Balance += checkOrder.Total
				if err := tx.Save(&wallet).Error; err != nil {
					return err
				}

				walletTx := models.WalletTransaction{
					WalletID: wallet.ID,
					Type:     models.WalletTxRefund,
					Amount:   checkOrder.Total,
					OrderID:  &checkOrder.ID,
				}
				if err := tx.Create(&walletTx).Error; err != nil {
					return err
				}
			}

			// Cancel DeliveryJob if any
			tx.Model(&models.DeliveryJob{}).Where("order_id = ?", checkOrder.ID).Update("status", models.StatusDikembalikan)

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
