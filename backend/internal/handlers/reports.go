package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

// @Summary BuyerSpendingReport
// @Description BuyerSpendingReport
// @Tags reports
// @Router /api/v1/buyer/report/spending [get]
func BuyerSpendingReport(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var orders []models.Order
	if err := db.DB.Where("buyer_id = ? AND current_status != ?", claims.UserID, models.StatusDikembalikan).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil data pesanan"})
		return
	}

	monthly := make(map[string]float64)
	for _, o := range orders {
		month := o.CreatedAt.Format("2006-01")
		monthly[month] += o.Total
	}

	c.JSON(http.StatusOK, gin.H{
		"spending_per_month": monthly,
	})
}

// @Summary SellerIncomeReport
// @Description SellerIncomeReport
// @Tags reports
// @Router /api/v1/seller/report/income [get]
func SellerIncomeReport(c *gin.Context) {
	claims := middleware.GetClaims(c)
	store, ok := getMyStoreOrAbort(c, claims.UserID)
	if !ok {
		return
	}

	var orders []models.Order
	if err := db.DB.Where("store_id = ? AND current_status = ?", store.ID, models.StatusPesananSelesai).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil data pesanan"})
		return
	}

	monthly := make(map[string]float64)
	for _, o := range orders {
		month := o.CreatedAt.Format("2006-01")
		monthly[month] += o.Subtotal
	}

	c.JSON(http.StatusOK, gin.H{
		"income_per_month": monthly,
	})
}
