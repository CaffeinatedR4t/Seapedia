package router

import (
	"github.com/gin-gonic/gin"

	"seapedia/internal/handlers"
	"seapedia/internal/middleware"
)

func Setup(r *gin.Engine) {
	r.Use(corsMiddleware())

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

	v1.GET("/reviews", handlers.ListReviews)
	v1.POST("/reviews", handlers.CreateReview)

	// Protected groups — routes added per level
	seller := v1.Group("/seller", middleware.AuthMiddleware(), middleware.RequireRole("seller"))
	_ = seller
	buyer := v1.Group("/buyer", middleware.AuthMiddleware(), middleware.RequireRole("buyer"))
	_ = buyer
	driver := v1.Group("/driver", middleware.AuthMiddleware(), middleware.RequireRole("driver"))
	_ = driver
	admin := v1.Group("/admin", middleware.AuthMiddleware(), middleware.RequireRole("admin"))
	_ = admin
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
