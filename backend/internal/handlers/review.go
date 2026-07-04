package handlers

import (
	"html"
	"net/http"

	"github.com/gin-gonic/gin"

	"seapedia/internal/db"
	"seapedia/internal/models"
)

type CreateReviewRequest struct {
	ReviewerName string `json:"reviewer_name" binding:"required,min=1,max=100"`
	Rating       int    `json:"rating" binding:"required,min=1,max=5"`
	Comment      string `json:"comment" binding:"required,min=1,max=1000"`
}

// @Summary ListReviews
// @Description ListReviews
// @Tags review
// @Router /api/v1/reviews [get]
func ListReviews(c *gin.Context) {
	var reviews []models.AppReview
	db.DB.Order("created_at desc").Limit(50).Find(&reviews)
	resp := make([]gin.H, len(reviews))
	for i, r := range reviews {
		resp[i] = gin.H{
			"id": r.ID, "reviewer_name": r.ReviewerName,
			"rating": r.Rating, "comment": r.Comment, "created_at": r.CreatedAt,
		}
	}
	if resp == nil {
		resp = []gin.H{}
	}
	c.JSON(http.StatusOK, resp)
}

// @Summary CreateReview
// @Description CreateReview
// @Tags review
// @Router /api/v1/reviews [post]
func CreateReview(c *gin.Context) {
	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	review := models.AppReview{
		ReviewerName: html.EscapeString(req.ReviewerName),
		Rating:       req.Rating,
		Comment:      html.EscapeString(req.Comment),
	}
	if err := db.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save review"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"id": review.ID, "reviewer_name": review.ReviewerName,
		"rating": review.Rating, "comment": review.Comment, "created_at": review.CreatedAt,
	})
}
