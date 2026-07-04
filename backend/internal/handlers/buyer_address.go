package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type AddressRequest struct {
	Label       string `json:"label" binding:"required,min=1,max=50"`
	FullAddress string `json:"full_address" binding:"required,min=10,max=500"`
}

// @Summary ListAddresses
// @Description ListAddresses
// @Tags buyer_address
// @Router /api/v1/buyer/address [get]
func ListAddresses(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var addresses []models.Address
	db.DB.Where("buyer_id = ?", claims.UserID).Find(&addresses)

	resp := make([]gin.H, len(addresses))
	for i, a := range addresses {
		resp[i] = gin.H{
			"id":           a.ID,
			"label":        a.Label,
			"full_address": a.FullAddress,
		}
	}
	if len(addresses) == 0 {
		resp = []gin.H{}
	}
	c.JSON(http.StatusOK, resp)
}

// @Summary CreateAddress
// @Description CreateAddress
// @Tags buyer_address
// @Router /api/v1/buyer/address [post]
func CreateAddress(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var req AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	addr := models.Address{
		BuyerID:     claims.UserID,
		Label:       req.Label,
		FullAddress: req.FullAddress,
	}

	if err := db.DB.Create(&addr).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyimpan alamat"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":           addr.ID,
		"label":        addr.Label,
		"full_address": addr.FullAddress,
	})
}

// @Summary UpdateAddress
// @Description UpdateAddress
// @Tags buyer_address
// @Router /api/v1/buyer/address/{id} [put]
func UpdateAddress(c *gin.Context) {
	claims := middleware.GetClaims(c)
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id tidak valid"})
		return
	}

	var req AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var addr models.Address
	if err := db.DB.Where("buyer_id = ?", claims.UserID).First(&addr, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "alamat tidak ditemukan"})
		return
	}

	addr.Label = req.Label
	addr.FullAddress = req.FullAddress
	if err := db.DB.Save(&addr).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memperbarui alamat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           addr.ID,
		"label":        addr.Label,
		"full_address": addr.FullAddress,
	})
}

// @Summary DeleteAddress
// @Description DeleteAddress
// @Tags buyer_address
// @Router /api/v1/buyer/address/{id} [delete]
func DeleteAddress(c *gin.Context) {
	claims := middleware.GetClaims(c)
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id tidak valid"})
		return
	}

	var addr models.Address
	if err := db.DB.Where("buyer_id = ?", claims.UserID).First(&addr, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "alamat tidak ditemukan"})
		return
	}

	if err := db.DB.Delete(&addr).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menghapus alamat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "alamat berhasil dihapus"})
}
