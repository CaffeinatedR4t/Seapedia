package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type CartRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type CartUpdate struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

func getOrCreateCart(userID uint) (*models.Cart, error) {
	var cart models.Cart
	err := db.DB.Preload("Items.Product.Store").Preload("Store").Where("buyer_id = ?", userID).First(&cart).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			cart = models.Cart{BuyerID: userID}
			if err := db.DB.Create(&cart).Error; err != nil {
				return nil, err
			}
			return &cart, nil
		}
		return nil, err
	}
	return &cart, nil
}

// @Summary GetCart
// @Description GetCart
// @Tags buyer_cart
// @Router /api/v1/buyer/cart [get]
func GetCart(c *gin.Context) {
	claims := middleware.GetClaims(c)
	cart, err := getOrCreateCart(claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil keranjang"})
		return
	}

	c.JSON(http.StatusOK, cartToJSON(cart))
}

// @Summary AddToCart
// @Description AddToCart
// @Tags buyer_cart
// @Router /api/v1/buyer/cart [post]
func AddToCart(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var req CartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var product models.Product
	if err := db.DB.Preload("Store").First(&product, req.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "produk tidak ditemukan"})
		return
	}

	if product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "stok tidak mencukupi"})
		return
	}

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var cart models.Cart
		if err := tx.Preload("Items").Where("buyer_id = ?", claims.UserID).First(&cart).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				cart = models.Cart{BuyerID: claims.UserID}
				if err := tx.Create(&cart).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		}

		// Single store enforcement
		if cart.StoreID != nil && *cart.StoreID != product.StoreID {
			if len(cart.Items) > 0 {
				return gorm.ErrInvalidData // Need to handle custom error msg
			}
			// If empty but StoreID is set, we can overwrite it
			cart.StoreID = &product.StoreID
			tx.Save(&cart)
		} else if cart.StoreID == nil {
			cart.StoreID = &product.StoreID
			tx.Save(&cart)
		}

		// Check if item already in cart
		var existingItem models.CartItem
		if err := tx.Where("cart_id = ? AND product_id = ?", cart.ID, product.ID).First(&existingItem).Error; err == nil {
			// Update quantity
			if product.Stock < existingItem.Quantity+req.Quantity {
				return gorm.ErrInvalidValue
			}
			existingItem.Quantity += req.Quantity
			return tx.Save(&existingItem).Error
		}

		// Add new item
		newItem := models.CartItem{
			CartID:    cart.ID,
			ProductID: product.ID,
			Quantity:  req.Quantity,
		}
		return tx.Create(&newItem).Error
	})

	if err != nil {
		if err == gorm.ErrInvalidData {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Keranjang hanya boleh berisi produk dari 1 toko yang sama. Kosongkan keranjang terlebih dahulu."})
			return
		}
		if err == gorm.ErrInvalidValue {
			c.JSON(http.StatusBadRequest, gin.H{"error": "total kuantitas melebihi stok yang tersedia"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menambahkan ke keranjang"})
		return
	}

	GetCart(c) // Return updated cart
}

// @Summary UpdateCartItem
// @Description UpdateCartItem
// @Tags buyer_cart
// @Router /api/v1/buyer/cart/{itemId} [put]
func UpdateCartItem(c *gin.Context) {
	claims := middleware.GetClaims(c)
	itemIdStr := c.Param("itemId")
	itemId, err := strconv.Atoi(itemIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id item tidak valid"})
		return
	}

	var req CartUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cart, err := getOrCreateCart(claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil keranjang"})
		return
	}

	var item models.CartItem
	if err := db.DB.Preload("Product").Where("id = ? AND cart_id = ?", itemId, cart.ID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "item tidak ditemukan di keranjang"})
		return
	}

	if item.Product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "stok tidak mencukupi"})
		return
	}

	item.Quantity = req.Quantity
	if err := db.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memperbarui keranjang"})
		return
	}

	GetCart(c)
}

// @Summary DeleteCartItem
// @Description DeleteCartItem
// @Tags buyer_cart
// @Router /api/v1/buyer/cart/{itemId} [delete]
func DeleteCartItem(c *gin.Context) {
	claims := middleware.GetClaims(c)
	itemIdStr := c.Param("itemId")
	itemId, err := strconv.Atoi(itemIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id item tidak valid"})
		return
	}

	cart, err := getOrCreateCart(claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil keranjang"})
		return
	}

	if err := db.DB.Where("id = ? AND cart_id = ?", itemId, cart.ID).Delete(&models.CartItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menghapus item"})
		return
	}

	// Clean up StoreID if cart is empty
	var remainingCount int64
	db.DB.Model(&models.CartItem{}).Where("cart_id = ?", cart.ID).Count(&remainingCount)
	if remainingCount == 0 {
		db.DB.Model(cart).Update("store_id", nil)
	}

	GetCart(c)
}

func cartToJSON(cart *models.Cart) gin.H {
	items := make([]gin.H, len(cart.Items))
	subtotal := 0.0

	for i, item := range cart.Items {
		items[i] = gin.H{
			"id":         item.ID,
			"product_id": item.ProductID,
			"product":    productToJSON(item.Product),
			"quantity":   item.Quantity,
		}
		subtotal += item.Product.Price * float64(item.Quantity)
	}
	if len(cart.Items) == 0 {
		items = []gin.H{}
	}

	var storeInfo interface{} = nil
	if cart.Store != nil {
		storeInfo = gin.H{
			"id":   cart.Store.ID,
			"name": cart.Store.Name,
		}
	}

	return gin.H{
		"id":       cart.ID,
		"store":    storeInfo,
		"items":    items,
		"subtotal": subtotal,
	}
}
