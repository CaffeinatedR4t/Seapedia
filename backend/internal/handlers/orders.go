package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
	"seapedia/internal/services"
)

type CheckoutRequest struct {
	AddressID      uint   `json:"address_id" binding:"required"`
	DeliveryMethod string `json:"delivery_method" binding:"required"`
	DiscountCode   string `json:"discount_code"`
	VoucherCode    string `json:"voucher_code"`
}

// @Summary Checkout
// @Description Checkout
// @Tags orders
// @Router /api/v1/buyer/checkout [post]
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

	var address models.Address
	if err := db.DB.Where("id = ? AND buyer_id = ?", req.AddressID, claims.UserID).First(&address).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "alamat pengiriman tidak valid"})
		return
	}

	codeToApply := req.DiscountCode
	if codeToApply == "" {
		codeToApply = req.VoucherCode
	}

	createdOrder, err := services.CheckoutOrder(claims.UserID, method, address.FullAddress, codeToApply)

	if err != nil {
		if errors.Is(err, services.ErrEmptyCart) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "keranjang belanja kosong"})
		} else if errors.Is(err, services.ErrStock) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "stok produk tidak mencukupi"})
		} else if errors.Is(err, services.ErrInsufficient) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "saldo dompet tidak mencukupi"})
		} else if errors.Is(err, services.ErrNoWallet) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "dompet tidak ditemukan"})
		} else if err.Error() == "voucher tidak ditemukan atau tidak berlaku untuk toko ini" || err.Error() == "kuota voucher sudah habis" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memproses checkout: " + err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "checkout berhasil", "order_id": createdOrder.ID})
}

// @Summary ListBuyerOrders
// @Description ListBuyerOrders
// @Tags orders
// @Router /api/v1/buyer/orders [get]
func ListBuyerOrders(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var orders []models.Order
	db.DB.Preload("Store").Preload("Items.Product").Where("buyer_id = ?", claims.UserID).Order("created_at desc").Find(&orders)
	c.JSON(http.StatusOK, mapOrdersToJSON(orders))
}

// @Summary GetBuyerOrder
// @Description GetBuyerOrder
// @Tags orders
// @Router /api/v1/buyer/orders/{id} [get]
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

// @Summary ListSellerOrders
// @Description ListSellerOrders
// @Tags orders
// @Router /api/v1/seller/orders [get]
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
