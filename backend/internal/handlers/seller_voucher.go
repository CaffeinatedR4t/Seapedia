package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type VoucherRequest struct {
	Code               string  `json:"code" binding:"required,min=3,max=50"`
	DiscountPercentage float64 `json:"discount_percentage" binding:"required,min=1,max=100"`
	MaxDiscount        float64 `json:"max_discount" binding:"required,min=0"`
	Stock              int     `json:"stock" binding:"required,min=1"`
}

func ListVouchers(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	var vouchers []models.DiscountVoucher
	db.DB.Where("store_id = ?", store.ID).Find(&vouchers)

	res := make([]gin.H, len(vouchers))
	for i, v := range vouchers {
		res[i] = gin.H{
			"id":                  v.ID,
			"code":                v.Code,
			"discount_percentage": v.DiscountPercentage,
			"max_discount":        v.MaxDiscount,
			"stock":               v.Stock,
		}
	}
	if len(vouchers) == 0 {
		res = []gin.H{}
	}
	c.JSON(http.StatusOK, res)
}

func CreateVoucher(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	var req VoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	voucher := models.DiscountVoucher{
		StoreID:            store.ID,
		Code:               req.Code,
		DiscountPercentage: req.DiscountPercentage,
		MaxDiscount:        req.MaxDiscount,
		Stock:              req.Stock,
	}

	if err := db.DB.Create(&voucher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat voucher atau kode sudah digunakan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":                  voucher.ID,
		"code":                voucher.Code,
		"discount_percentage": voucher.DiscountPercentage,
		"max_discount":        voucher.MaxDiscount,
		"stock":               voucher.Stock,
	})
}
