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

type VoucherRequest struct {
	Code         string `json:"code" binding:"required"`
	DiscountRule string `json:"discount_rule" binding:"required"`
	UsageLimit   int    `json:"usage_limit" binding:"required,min=1"`
}

// @Summary AdminStats
// @Description AdminStats
// @Tags admin
// @Router /api/v1/admin/stats [get]
func AdminStats(c *gin.Context) {
	var users, stores, products, orders, vouchers, promos, jobs int64
	db.DB.Model(&models.User{}).Count(&users)
	db.DB.Model(&models.Store{}).Count(&stores)
	db.DB.Model(&models.Product{}).Count(&products)
	db.DB.Model(&models.Order{}).Count(&orders)
	db.DB.Model(&models.Voucher{}).Count(&vouchers)
	db.DB.Model(&models.Promo{}).Count(&promos)
	db.DB.Model(&models.DeliveryJob{}).Count(&jobs)

	var activeOrders []models.Order
	db.DB.Where("current_status IN ?", []models.OrderStatus{models.StatusSedangDikemas, models.StatusMenungguPengirim}).Find(&activeOrders)
	overdueCount := int64(0)
	for _, o := range activeOrders {
		slaDays := 3
		if o.DeliveryMethod == models.DeliveryInstant {
			slaDays = 1
		} else if o.DeliveryMethod == models.DeliveryNextDay {
			slaDays = 2
		}
		if time.Since(o.UpdatedAt).Hours() > float64(slaDays*24) {
			overdueCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"users":          users,
		"stores":         stores,
		"products":       products,
		"orders":         orders,
		"vouchers":       vouchers,
		"promos":         promos,
		"jobs":           jobs,
		"overdue_orders": overdueCount,
	})
}

// @Summary ListPromos
// @Description ListPromos
// @Tags admin
// @Router /api/v1/admin/promos [get]
func ListPromos(c *gin.Context) {
	var promos []models.Promo
	db.DB.Find(&promos)
	c.JSON(http.StatusOK, promos)
}

// @Summary CreatePromo
// @Description CreatePromo
// @Tags admin
// @Router /api/v1/admin/promos [post]
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

// @Summary GetPromo
// @Description GetPromo
// @Tags admin
// @Router /api/v1/admin/promos/{id} [get]
func GetPromo(c *gin.Context) {
	id := c.Param("id")
	var promo models.Promo
	if err := db.DB.First(&promo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "promo tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, promo)
}

// @Summary ListVouchers
// @Description ListVouchers
// @Tags admin
// @Router /api/v1/admin/vouchers [get]
func ListVouchers(c *gin.Context) {
	var vouchers []models.Voucher
	db.DB.Find(&vouchers)
	c.JSON(http.StatusOK, vouchers)
}

// @Summary GetVoucher
// @Description GetVoucher
// @Tags admin
// @Router /api/v1/admin/vouchers/{id} [get]
func GetVoucher(c *gin.Context) {
	id := c.Param("id")
	var voucher models.Voucher
	if err := db.DB.First(&voucher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "voucher tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, voucher)
}

// @Summary CreateVoucher
// @Description CreateVoucher
// @Tags admin
// @Router /api/v1/admin/vouchers [post]
func CreateVoucher(c *gin.Context) {
	var req VoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	voucher := models.Voucher{
		Code:         req.Code,
		DiscountRule: req.DiscountRule,
		UsageLimit:   req.UsageLimit,
		ExpiryDate:   time.Now().Add(30 * 24 * time.Hour), // 30 days
	}
	
	if err := db.DB.Create(&voucher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat voucher"})
		return
	}
	
	c.JSON(http.StatusCreated, voucher)
}

// @Summary SimulateOverdue
// @Description SimulateOverdue
// @Tags admin
// @Router /api/v1/admin/simulate-overdue [post]
func SimulateOverdue(c *gin.Context) {
	// SimulateOverdue fast-forwards time checking for SLAs.
	// We'll define SLA: Instant (1 day), Next Day (2 days), Regular (3 days).
	var orders []models.Order
	db.DB.Where("current_status IN ?", []models.OrderStatus{models.StatusSedangDikemas, models.StatusMenungguPengirim}).Find(&orders)

	processed := 0

	for _, order := range orders {
		// Calculate SLA limit
		slaDays := 3
		if order.DeliveryMethod == models.DeliveryInstant {
			slaDays = 1
		} else if order.DeliveryMethod == models.DeliveryNextDay {
			slaDays = 2
		}

		// For demonstration, if `force=true` is passed, we cancel everything.
		force := c.Query("force") == "true"
		
		// Real logic: if time.Since(order.UpdatedAt).Hours() > float64(slaDays*24)
		if !force && time.Since(order.UpdatedAt).Hours() <= float64(slaDays*24) {
			continue
		}

		err := db.DB.Transaction(func(tx *gorm.DB) error {
			// Idempotency check: Ensure order is not already Dikembalikan
			var checkOrder models.Order
			if err := tx.First(&checkOrder, order.ID).Error; err != nil {
				return err
			}
			if checkOrder.CurrentStatus == models.StatusDikembalikan {
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
