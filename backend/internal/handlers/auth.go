package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/middleware"
	"seapedia/internal/models"
)

type RegisterRequest struct {
	Username string   `json:"username" binding:"required,min=3,max=50"`
	Password string   `json:"password" binding:"required,min=6"`
	Roles    []string `json:"roles" binding:"required,min=1"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type SelectRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

// @Summary Register
// @Description Register
// @Tags auth
// @Router /api/v1/auth/register [post]
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validRoles := map[string]bool{"seller": true, "buyer": true, "driver": true}
	for _, r := range req.Roles {
		if !validRoles[r] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role: " + r})
			return
		}
	}

	var existing models.User
	if err := db.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "username already taken"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	var user models.User
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		user = models.User{Username: req.Username, PasswordHash: string(hash)}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		for _, r := range req.Roles {
			role := models.UserRole{UserID: user.ID, Role: models.RoleName(r)}
			if err := tx.Create(&role).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "registered successfully",
		"user":    gin.H{"id": user.ID, "username": user.Username, "roles": req.Roles},
	})
}

// @Summary Login
// @Description Login
// @Tags auth
// @Router /api/v1/auth/login [post]
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := db.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	var userRoles []models.UserRole
	db.DB.Where("user_id = ?", user.ID).Find(&userRoles)
	roleNames := make([]string, len(userRoles))
	for i, r := range userRoles {
		roleNames[i] = string(r.Role)
	}

	activeRole := determineActiveRole(roleNames)
	requiresRoleSelection := activeRole == "" && len(roleNames) > 1

	token, err := middleware.GenerateToken(user.ID, user.Username, roleNames, activeRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id": user.ID, "username": user.Username,
			"roles": roleNames, "active_role": activeRole,
		},
		"requires_role_selection": requiresRoleSelection,
	})
}

// @Summary Me
// @Description Me
// @Tags auth
// @Router /api/v1/auth/me [get]
func Me(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var userRoles []models.UserRole
	db.DB.Where("user_id = ?", claims.UserID).Find(&userRoles)
	roleNames := make([]string, len(userRoles))
	for i, r := range userRoles {
		roleNames[i] = string(r.Role)
	}
	c.JSON(http.StatusOK, gin.H{
		"id": claims.UserID, "username": claims.Username,
		"roles": roleNames, "active_role": claims.ActiveRole,
	})
}

// @Summary SelectRole
// @Description SelectRole
// @Tags auth
// @Router /api/v1/auth/select-role [post]
func SelectRole(c *gin.Context) {
	claims := middleware.GetClaims(c)
	var req SelectRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hasRole := false
	for _, r := range claims.Roles {
		if r == req.Role {
			hasRole = true
			break
		}
	}
	if !hasRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "you do not own the role: " + req.Role})
		return
	}
	token, err := middleware.GenerateToken(claims.UserID, claims.Username, claims.Roles, req.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token, "active_role": req.Role, "message": "role selected: " + req.Role})
}

func determineActiveRole(roles []string) string {
	for _, r := range roles {
		if r == "admin" {
			return "admin"
		}
	}
	if len(roles) == 1 {
		return roles[0]
	}
	return ""
}
