package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"seapedia/internal/db"
	"seapedia/internal/models"
)

func ListProducts(c *gin.Context) {
	var products []models.Product
	if err := db.DB.Preload("Store").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch products"})
		return
	}
	if len(products) == 0 {
		c.JSON(http.StatusOK, dummyProducts())
		return
	}
	resp := make([]gin.H, len(products))
	for i, p := range products {
		resp[i] = productToJSON(p)
	}
	c.JSON(http.StatusOK, resp)
}

func GetProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}
	var product models.Product
	if err := db.DB.Preload("Store").First(&product, id).Error; err != nil {
		for _, d := range dummyProducts() {
			if int(d["id"].(int)) == id {
				c.JSON(http.StatusOK, d)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.JSON(http.StatusOK, productToJSON(product))
}

func productToJSON(p models.Product) gin.H {
	storeInfo := gin.H{"id": 0, "name": "Unknown Store"}
	if p.Store.ID != 0 {
		storeInfo = gin.H{"id": p.Store.ID, "name": p.Store.Name}
	}
	return gin.H{
		"id": p.ID, "name": p.Name, "description": p.Description,
		"price": p.Price, "stock": p.Stock, "store": storeInfo,
	}
}

func dummyProducts() []gin.H {
	return []gin.H{
		{"id": 1, "name": "Snorkeling Set Premium", "description": "Set snorkeling lengkap dengan masker, fins, dan dry bag. Cocok untuk petualangan bawah laut.", "price": 350000, "stock": 15, "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500", "store": gin.H{"id": 1, "name": "Toko Selam Indo"}},
		{"id": 2, "name": "Kaos Pantai Tropis", "description": "Kaos pantai motif ikan tropis, bahan cotton breathable. Cocok untuk liburan laut.", "price": 120000, "stock": 50, "image": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500", "store": gin.H{"id": 2, "name": "Ocean Fashion"}},
		{"id": 3, "name": "Action Cam Waterproof", "description": "Kamera aksi tahan air hingga 30m kedalaman. Rekam petualangan laut Anda!", "price": 850000, "stock": 8, "image": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500", "store": gin.H{"id": 1, "name": "Toko Selam Indo"}},
		{"id": 4, "name": "Topi Pantai Wide Brim", "description": "Topi pantai jerami, UV protection SPF50+. Gaya sekaligus fungsional di tepi pantai.", "price": 95000, "stock": 30, "image": "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500", "store": gin.H{"id": 2, "name": "Ocean Fashion"}},
		{"id": 5, "name": "Paket Diving Gili Islands", "description": "Voucher paket diving 2 hari di Gili Trawangan. Sudah termasuk equipment dan instruktur bersertifikat.", "price": 1250000, "stock": 5, "image": "https://images.unsplash.com/photo-1682687218904-be49e05ef6d2?w=500", "store": gin.H{"id": 3, "name": "Bali Diving Center"}},
		{"id": 6, "name": "Surfboard Shortboard 6'2\"", "description": "Surfboard untuk intermediate surfer. Ringan, responsif, dan cocok untuk ombak sedang.", "price": 2800000, "stock": 3, "image": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500", "store": gin.H{"id": 3, "name": "Bali Diving Center"}},
	}
}
