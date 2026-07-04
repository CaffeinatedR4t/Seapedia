package services

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"seapedia/internal/db"
	"seapedia/internal/models"
)

var (
	ErrEmptyCart      = errors.New("keranjang kosong")
	ErrInsufficient   = errors.New("saldo tidak cukup")
	ErrNoWallet       = errors.New("tidak ada dompet")
	ErrStock          = errors.New("stok tidak cukup")
)

func getDeliveryFee(method models.DeliveryMethod) float64 {
	switch method {
	case models.DeliveryInstant:
		return 15000
	case models.DeliveryNextDay:
		return 10000
	case models.DeliveryRegular:
		return 5000
	}
	return 5000 // fallback
}

func calculateDiscount(subtotal float64, rule string) float64 {
	parts := strings.Split(rule, ":")
	if len(parts) != 2 {
		return 0
	}
	val, err := strconv.ParseFloat(parts[1], 64)
	if err != nil {
		return 0
	}
	if parts[0] == "percent" {
		return subtotal * (val / 100.0)
	} else if parts[0] == "flat" {
		if val > subtotal {
			return subtotal
		}
		return val
	}
	return 0
}

func CheckoutOrder(buyerID uint, method models.DeliveryMethod, deliveryAddress string, discountCode string) (*models.Order, error) {
	var createdOrder models.Order

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var cart models.Cart
		if err := tx.Preload("Items.Product").Where("buyer_id = ?", buyerID).First(&cart).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if len(cart.Items) == 0 || cart.StoreID == nil {
			return ErrEmptyCart
		}

		subtotal := 0.0
		for _, item := range cart.Items {
			if item.Product.Stock < item.Quantity {
				return ErrStock
			}
			subtotal += item.Product.Price * float64(item.Quantity)
		}

		deliveryFee := getDeliveryFee(method)

		discount := 0.0
		var voucherID *uint
		var promoID *uint

		if discountCode != "" {
			var promo models.Promo
			if err := tx.Where("code = ?", discountCode).First(&promo).Error; err == nil {
				if promo.ExpiryDate.Before(time.Now()) {
					return errors.New("promo sudah kedaluwarsa")
				}
				discount = calculateDiscount(subtotal, promo.DiscountRule)
				promoID = &promo.ID
			} else {
				var voucher models.Voucher
				if err := tx.Where("code = ?", discountCode).First(&voucher).Error; err == nil {
					if voucher.ExpiryDate.Before(time.Now()) {
						return errors.New("voucher sudah kedaluwarsa")
					}
					if voucher.UsageCount >= voucher.UsageLimit {
						return errors.New("kuota voucher sudah habis")
					}
					discount = calculateDiscount(subtotal, voucher.DiscountRule)
					voucherID = &voucher.ID

					if err := tx.Model(&voucher).UpdateColumn("usage_count", gorm.Expr("usage_count + 1")).Error; err != nil {
						return err
					}
				} else {
					return errors.New("kode diskon tidak valid")
				}
			}
		}

		tax := (subtotal + deliveryFee) * 0.12
		total := subtotal + deliveryFee - discount + tax
		if total < 0 {
			total = 0
		}

		var wallet models.Wallet
		if err := tx.Where("buyer_id = ?", buyerID).First(&wallet).Error; err != nil {
			return ErrNoWallet
		}

		if wallet.Balance < total {
			return ErrInsufficient
		}

		wallet.Balance -= total
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		order := models.Order{
			BuyerID:        buyerID,
			StoreID:        *cart.StoreID,
			DeliveryMethod: method,
			DeliveryAddress: deliveryAddress,
			Subtotal:       subtotal,
			Discount:       discount,
			DeliveryFee:    deliveryFee,
			PPN:            tax,
			Total:          total,
			CurrentStatus:  models.StatusSedangDikemas,
			VoucherID:      voucherID,
			PromoID:        promoID,
		}

		if err := tx.Create(&order).Error; err != nil {
			return err
		}
		createdOrder = order

		walletTx := models.WalletTransaction{
			WalletID: wallet.ID,
			Type:     models.WalletTxCharge,
			Amount:   -total,
			OrderID:  &order.ID,
		}
		if err := tx.Create(&walletTx).Error; err != nil {
			return err
		}

		history := models.OrderStatusHistory{
			OrderID: order.ID,
			Status:  models.StatusSedangDikemas,
		}
		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		for _, item := range cart.Items {
			orderItem := models.OrderItem{
				OrderID:         order.ID,
				ProductID:       item.ProductID,
				Quantity:        item.Quantity,
				PriceAtPurchase: item.Product.Price,
			}
			if err := tx.Create(&orderItem).Error; err != nil {
				return err
			}

			if err := tx.Model(&item.Product).UpdateColumn("stock", gorm.Expr("stock - ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		if err := tx.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{}).Error; err != nil {
			return err
		}
		if err := tx.Model(&cart).Update("store_id", nil).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &createdOrder, nil
}
