package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type TopUpRequest struct {
	Amount float64 `json:"amount" binding:"required,min=10000"`
}

// @Summary GetWallet
// @Description GetWallet
// @Tags buyer_wallet
// @Router /api/v1/buyer/wallet [get]
func GetWallet(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var wallet models.Wallet
	
	err := db.DB.Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc")
	}).Where("buyer_id = ?", claims.UserID).First(&wallet).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			wallet = models.Wallet{BuyerID: claims.UserID, Balance: 0}
			db.DB.Create(&wallet)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil dompet"})
			return
		}
	}

	txs := make([]gin.H, len(wallet.Transactions))
	for i, tx := range wallet.Transactions {
		txs[i] = gin.H{
			"id":         tx.ID,
			"type":       tx.Type,
			"amount":     tx.Amount,
			"order_id":   tx.OrderID,
			"created_at": tx.CreatedAt,
		}
	}
	if len(wallet.Transactions) == 0 {
		txs = []gin.H{}
	}

	c.JSON(http.StatusOK, gin.H{
		"balance":      wallet.Balance,
		"transactions": txs,
	})
}

// @Summary TopUpWallet
// @Description TopUpWallet
// @Tags buyer_wallet
// @Router /api/v1/buyer/wallet/topup [post]
func TopUpWallet(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var req TopUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var wallet models.Wallet
		if err := tx.Where("buyer_id = ?", claims.UserID).First(&wallet).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				wallet = models.Wallet{BuyerID: claims.UserID, Balance: 0}
				if err := tx.Create(&wallet).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		}

		wallet.Balance += req.Amount
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		walletTx := models.WalletTransaction{
			WalletID: wallet.ID,
			Type:     models.WalletTxTopup,
			Amount:   req.Amount,
		}
		if err := tx.Create(&walletTx).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal topup dompet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "topup berhasil", "amount": req.Amount})
}
