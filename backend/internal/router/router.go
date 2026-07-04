package router

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "seapedia/docs"
	"seapedia/internal/handlers"
	"seapedia/internal/middleware"
)

func Setup(r *gin.Engine) {
	r.Use(corsMiddleware())

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	v1 := r.Group("/api/v1")

	authGroup := v1.Group("/auth")
	{
		authGroup.POST("/register", handlers.Register)
		authGroup.POST("/login", handlers.Login)
		authGroup.GET("/me", middleware.AuthMiddleware(), handlers.Me)
		authGroup.POST("/select-role", middleware.AuthMiddleware(), handlers.SelectRole)
	}

	v1.GET("/products", handlers.ListProducts)
	v1.GET("/products/:id", handlers.GetProduct)

	v1.GET("/stores/:id", handlers.GetStore)

	v1.GET("/reviews", handlers.ListReviews)
	v1.POST("/reviews", handlers.CreateReview)

	// Protected groups — routes added per level
	seller := v1.Group("/seller", middleware.AuthMiddleware(), middleware.RequireRole("seller"))
	{
		seller.GET("/store", handlers.GetMyStore)
		seller.POST("/store", handlers.CreateStore)
		seller.PUT("/store", handlers.UpdateStore)

		seller.GET("/products", handlers.ListMyProducts)
		seller.POST("/products", handlers.CreateProduct)
		seller.PUT("/products/:id", handlers.UpdateProduct)
		seller.DELETE("/products/:id", handlers.DeleteProduct)

		seller.GET("/orders", handlers.ListSellerOrders)
		seller.PUT("/orders/:id/status", handlers.UpdateSellerOrderStatus)

		seller.GET("/report/income", handlers.SellerIncomeReport)
	}
	buyer := v1.Group("/buyer", middleware.AuthMiddleware(), middleware.RequireRole("buyer"))
	{
		buyer.GET("/wallet", handlers.GetWallet)
		buyer.POST("/wallet/topup", handlers.TopUpWallet)

		buyer.GET("/address", handlers.ListAddresses)
		buyer.POST("/address", handlers.CreateAddress)
		buyer.PUT("/address/:id", handlers.UpdateAddress)
		buyer.DELETE("/address/:id", handlers.DeleteAddress)

		buyer.GET("/cart", handlers.GetCart)
		buyer.POST("/cart", handlers.AddToCart)
		buyer.PUT("/cart/:itemId", handlers.UpdateCartItem)
		buyer.DELETE("/cart/:itemId", handlers.DeleteCartItem)

		buyer.POST("/checkout", handlers.Checkout)
		buyer.GET("/orders", handlers.ListBuyerOrders)
		buyer.GET("/orders/:id", handlers.GetBuyerOrder)
		
		buyer.GET("/report/spending", handlers.BuyerSpendingReport)
	}
	driver := v1.Group("/driver", middleware.AuthMiddleware(), middleware.RequireRole("driver"))
	{
		driver.GET("/orders/available", handlers.ListAvailableOrders)
		driver.GET("/orders/active", handlers.ListActiveOrders)
		driver.GET("/orders/history", handlers.JobHistory)
		driver.PUT("/orders/:id/pickup", handlers.PickupOrder)
		driver.PUT("/orders/:id/finish", handlers.FinishOrder)
		driver.GET("/earnings", handlers.DriverEarnings)
	}
	admin := v1.Group("/admin", middleware.AuthMiddleware(), middleware.RequireRole("admin"))
	{
		admin.GET("/stats", handlers.AdminStats)
		admin.GET("/promos", handlers.ListPromos)
		admin.POST("/promos", handlers.CreatePromo)
		admin.GET("/promos/:id", handlers.GetPromo)
		admin.GET("/vouchers", handlers.ListVouchers)
		admin.POST("/vouchers", handlers.CreateVoucher)
		admin.GET("/vouchers/:id", handlers.GetVoucher)
		admin.POST("/simulate-overdue", handlers.SimulateOverdue)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
