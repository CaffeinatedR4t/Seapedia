package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type CheckoutRequest struct {
	DeliveryMethod string `json:"delivery_method" binding:"required"`
	VoucherCode    string `json:"voucher_code"`
}

func getDeliveryFee(method models.DeliveryMethod) float64 {
	switch method {
	case models.DeliveryInstant:
		return 15000
	case models.DeliveryNextDay:
		return 10000
	case models.DeliveryRegular:
		return 5000
	}
	return 5000 // fallback
}

var (
	ErrEmptyCart      = errors.New("keranjang kosong")
	ErrInsufficient   = errors.New("saldo tidak cukup")
	ErrNoWallet       = errors.New("tidak ada dompet")
	ErrStock          = errors.New("stok tidak cukup")
)

func Checkout(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	method := models.DeliveryMethod(req.DeliveryMethod)
	if method != models.DeliveryInstant && method != models.DeliveryNextDay && method != models.DeliveryRegular {
		c.JSON(http.StatusBadRequest, gin.H{"error": "metode pengiriman tidak valid"})
		return
	}

	var createdOrder models.Order

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var cart models.Cart
		if err := tx.Preload("Items.Product").Where("buyer_id = ?", claims.UserID).First(&cart).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if len(cart.Items) == 0 || cart.StoreID == nil {
			return ErrEmptyCart
		}

		subtotal := 0.0
		for _, item := range cart.Items {
			if item.Product.Stock < item.Quantity {
				return ErrStock // Stock insufficient
			}
			subtotal += item.Product.Price * float64(item.Quantity)
		}

		deliveryFee := getDeliveryFee(method)
		discount := 0.0

		var voucher models.DiscountVoucher
		if req.VoucherCode != "" {
			if err := tx.Where("code = ? AND store_id = ?", req.VoucherCode, cart.StoreID).First(&voucher).Error; err != nil {
				return errors.New("voucher tidak ditemukan atau tidak berlaku untuk toko ini")
			}
			if voucher.Stock <= 0 {
				return errors.New("kuota voucher sudah habis")
			}
			// Calculate discount
			discountCalc := subtotal * (voucher.DiscountPercentage / 100.0)
			if discountCalc > voucher.MaxDiscount {
				discountCalc = voucher.MaxDiscount
			}
			discount = discountCalc
		}

		tax := (subtotal + deliveryFee - discount) * 0.12
		total := subtotal + deliveryFee - discount + tax

		// Deduct from wallet
		var wallet models.Wallet
		if err := tx.Where("buyer_id = ?", claims.UserID).First(&wallet).Error; err != nil {
			return ErrNoWallet // No wallet
		}

		if wallet.Balance < total {
			return ErrInsufficient // Insufficient funds
		}

		wallet.Balance -= total
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		// Create Order
		order := models.Order{
			BuyerID:        claims.UserID,
			StoreID:        *cart.StoreID,
			DeliveryMethod: method,
			Subtotal:       subtotal,
			Discount:       discount,
			DeliveryFee:    deliveryFee,
			PPN:            tax,
			Total:          total,
			CurrentStatus:  models.StatusSedangDikemas,
		}
		if req.VoucherCode != "" {
			order.VoucherID = &voucher.ID
		}

		if err := tx.Create(&order).Error; err != nil {
			return err
		}
		createdOrder = order

		if req.VoucherCode != "" {
			if err := tx.Model(&voucher).UpdateColumn("stock", gorm.Expr("stock - 1")).Error; err != nil {
				return err
			}
		}

		// Wallet tx
		walletTx := models.WalletTransaction{
			WalletID: wallet.ID,
			Type:     models.WalletTxCharge,
			Amount:   -total,
			OrderID:  &order.ID,
		}
		if err := tx.Create(&walletTx).Error; err != nil {
			return err
		}

		// Order Status History
		history := models.OrderStatusHistory{
			OrderID: order.ID,
			Status:  models.StatusSedangDikemas,
		}
		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		// Process items
		for _, item := range cart.Items {
			orderItem := models.OrderItem{
				OrderID:         order.ID,
				ProductID:       item.ProductID,
				Quantity:        item.Quantity,
				PriceAtPurchase: item.Product.Price,
			}
			if err := tx.Create(&orderItem).Error; err != nil {
				return err
			}

			// Reduce stock
			if err := tx.Model(&item.Product).UpdateColumn("stock", gorm.Expr("stock - ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		// Clear cart
		if err := tx.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{}).Error; err != nil {
			return err
		}
		if err := tx.Model(&cart).Update("store_id", nil).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		if errors.Is(err, ErrEmptyCart) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "keranjang belanja kosong"})
		} else if errors.Is(err, ErrStock) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "stok produk tidak mencukupi"})
		} else if errors.Is(err, ErrInsufficient) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "saldo dompet tidak mencukupi"})
		} else if errors.Is(err, ErrNoWallet) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "dompet tidak ditemukan"})
		} else if err.Error() == "voucher tidak ditemukan atau tidak berlaku untuk toko ini" || err.Error() == "kuota voucher sudah habis" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memproses checkout"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "checkout berhasil", "order_id": createdOrder.ID})
}

func ListBuyerOrders(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var orders []models.Order
	db.DB.Preload("Store").Preload("Items.Product").Where("buyer_id = ?", claims.UserID).Order("created_at desc").Find(&orders)
	c.JSON(http.StatusOK, mapOrdersToJSON(orders))
}

func GetBuyerOrder(c *gin.Context) {
	claims := middleware.GetClaims(c)
	id := c.Param("id")
	var order models.Order
	if err := db.DB.Preload("Store").Preload("Items.Product").Preload("StatusHistory", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc")
	}).Where("id = ? AND buyer_id = ?", id, claims.UserID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "pesanan tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, orderDetailToJSON(order))
}

func ListSellerOrders(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	var orders []models.Order
	db.DB.Preload("Buyer").Preload("Items.Product").Where("store_id = ?", store.ID).Order("created_at desc").Find(&orders)
	c.JSON(http.StatusOK, mapOrdersToJSON(orders))
}

func mapOrdersToJSON(orders []models.Order) []gin.H {
	res := make([]gin.H, len(orders))
	for i, o := range orders {
		res[i] = gin.H{
			"id":              o.ID,
			"created_at":      o.CreatedAt,
			"total":           o.Total,
			"status":          o.CurrentStatus,
			"delivery_method": o.DeliveryMethod,
			"store_name":      o.Store.Name,
		}
	}
	if len(orders) == 0 {
		return []gin.H{}
	}
	return res
}

func orderDetailToJSON(o models.Order) gin.H {
	items := make([]gin.H, len(o.Items))
	for i, it := range o.Items {
		items[i] = gin.H{
			"id":                it.ID,
			"product_name":      it.Product.Name,
			"quantity":          it.Quantity,
			"price_at_purchase": it.PriceAtPurchase,
		}
	}

	history := make([]gin.H, len(o.StatusHistory))
	for i, h := range o.StatusHistory {
		history[i] = gin.H{
			"status":     h.Status,
			"created_at": h.CreatedAt,
		}
	}

	return gin.H{
		"id":              o.ID,
		"created_at":      o.CreatedAt,
		"subtotal":        o.Subtotal,
		"discount":        o.Discount,
		"delivery_fee":    o.DeliveryFee,
		"ppn":             o.PPN,
		"total":           o.Total,
		"status":          o.CurrentStatus,
		"delivery_method": o.DeliveryMethod,
		"store_name":      o.Store.Name,
		"items":           items,
		"history":         history,
	}
}
