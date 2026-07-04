package models

import (
	"time"

	"gorm.io/gorm"
)

// ─── Enums / constants ───────────────────────────────────────────────────────

type RoleName string

const (
	RoleAdmin  RoleName = "admin"
	RoleSeller RoleName = "seller"
	RoleBuyer  RoleName = "buyer"
	RoleDriver RoleName = "driver"
)

type OrderStatus string

const (
	StatusSedangDikemas     OrderStatus = "Sedang Dikemas"      // seller processing
	StatusMenungguPengirim  OrderStatus = "Menunggu Pengirim"   // waiting for driver
	StatusSedangDikirim     OrderStatus = "Sedang Dikirim"      // driver picked up
	StatusPesananSelesai    OrderStatus = "Pesanan Selesai"     // delivered
	StatusDikembalikan      OrderStatus = "Dikembalikan"        // refunded / returned
)

type DeliveryMethod string

const (
	DeliveryInstant  DeliveryMethod = "Instant"
	DeliveryNextDay  DeliveryMethod = "Next Day"
	DeliveryRegular  DeliveryMethod = "Regular"
)

type WalletTxType string

const (
	WalletTxTopup  WalletTxType = "topup"
	WalletTxCharge WalletTxType = "charge"
	WalletTxRefund WalletTxType = "refund"
)

// ─── User & Auth ─────────────────────────────────────────────────────────────

// User is the central identity record.
// A user may have multiple roles (see UserRole join table).
type User struct {
	gorm.Model
	Username     string     `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash string     `gorm:"not null"             json:"-"`
	Roles        []UserRole `gorm:"foreignKey:UserID"    json:"roles,omitempty"`
}

// UserRole is the many-to-many join between User and a role name.
// A single username may hold Seller + Buyer + Driver simultaneously.
// Admin role is exclusive (enforced at application level).
type UserRole struct {
	ID     uint     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID uint     `gorm:"not null;index"           json:"user_id"`
	Role   RoleName `gorm:"not null"                 json:"role"`
}

// ─── Store & Products ────────────────────────────────────────────────────────

// Store belongs to a Seller (User).
// Name must be unique across the platform (DB-level uniqueIndex).
type Store struct {
	gorm.Model
	SellerID    uint      `gorm:"not null;index"        json:"seller_id"`
	Seller      User      `gorm:"foreignKey:SellerID"   json:"seller,omitempty"`
	Name        string    `gorm:"uniqueIndex;not null"  json:"name"`
	Description string    `json:"description"`
	Products    []Product `gorm:"foreignKey:StoreID"    json:"products,omitempty"`
}

// Product belongs to a Store.
type Product struct {
	gorm.Model
	StoreID     uint    `gorm:"not null;index"      json:"store_id"`
	Store       Store   `gorm:"foreignKey:StoreID"  json:"store,omitempty"`
	Name        string  `gorm:"not null"            json:"name"`
	Description string  `json:"description"`
	Price       float64 `gorm:"not null"            json:"price"`
	Stock       int     `gorm:"not null;default:0"  json:"stock"`
	ImageURL    string  `json:"image_url,omitempty"`
}

// ─── Cart ────────────────────────────────────────────────────────────────────

// Cart is per-buyer, single-store.
// StoreID is set on first item add; enforced in the service layer.
type Cart struct {
	gorm.Model
	BuyerID  uint       `gorm:"not null;uniqueIndex" json:"buyer_id"`
	StoreID  *uint      `json:"store_id"`            // nil until first item added
	Store    *Store     `gorm:"foreignKey:StoreID"   json:"store,omitempty"`
	Items    []CartItem `gorm:"foreignKey:CartID"    json:"items,omitempty"`
}

// CartItem is one product line in a Cart.
type CartItem struct {
	ID        uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	CartID    uint    `gorm:"not null;index"           json:"cart_id"`
	ProductID uint    `gorm:"not null"                 json:"product_id"`
	Product   Product `gorm:"foreignKey:ProductID"     json:"product,omitempty"`
	Quantity  int     `gorm:"not null;default:1"       json:"quantity"`
}

// ─── Orders ──────────────────────────────────────────────────────────────────

// Order is the central transaction record.
// Financial fields are stored as snapshots at the time of checkout.
type Order struct {
	gorm.Model
	BuyerID        uint           `gorm:"not null;index"          json:"buyer_id"`
	Buyer          User           `gorm:"foreignKey:BuyerID"      json:"buyer,omitempty"`
	StoreID        uint           `gorm:"not null;index"          json:"store_id"`
	Store          Store          `gorm:"foreignKey:StoreID"      json:"store,omitempty"`
	DriverID       *uint          `json:"driver_id"`
	Driver         *User          `gorm:"foreignKey:DriverID"     json:"driver,omitempty"`
	DeliveryMethod DeliveryMethod `gorm:"not null"                json:"delivery_method"`
	DeliveryAddress string        `gorm:"not null"                json:"delivery_address"`
	Subtotal       float64        `gorm:"not null"                json:"subtotal"`
	Discount       float64        `gorm:"default:0"               json:"discount"`
	DeliveryFee    float64        `gorm:"not null"                json:"delivery_fee"`
	PPN            float64        `gorm:"not null"                json:"ppn"`
	Total          float64        `gorm:"not null"                json:"total"`
	CurrentStatus  OrderStatus    `gorm:"not null"                json:"current_status"`
	VoucherID      *uint          `json:"voucher_id"`
	PromoID        *uint          `json:"promo_id"`
	Items          []OrderItem    `gorm:"foreignKey:OrderID"      json:"items,omitempty"`
	StatusHistory  []OrderStatusHistory `gorm:"foreignKey:OrderID"      json:"status_history,omitempty"`

}


// OrderItem is a snapshot of a product line at the time of purchase.
type OrderItem struct {
	ID             uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID        uint    `gorm:"not null;index"           json:"order_id"`
	ProductID      uint    `gorm:"not null"                 json:"product_id"`
	Product        Product `gorm:"foreignKey:ProductID"     json:"product,omitempty"`
	Quantity       int     `gorm:"not null"                 json:"quantity"`
	PriceAtPurchase float64 `gorm:"not null"                json:"price_at_purchase"`
}



// OrderStatusHistory is an append-only log of every status transition.
type OrderStatusHistory struct {
	ID        uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID   uint        `gorm:"not null;index"           json:"order_id"`
	Status    OrderStatus `gorm:"not null"                 json:"status"`
	CreatedAt time.Time   `json:"created_at"`
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

// Wallet holds a Buyer's running balance.
type Wallet struct {
	gorm.Model
	BuyerID  uint                `gorm:"not null;uniqueIndex"   json:"buyer_id"`
	Balance  float64             `gorm:"not null;default:0"     json:"balance"`
	Transactions []WalletTransaction `gorm:"foreignKey:WalletID" json:"transactions,omitempty"`
}

// WalletTransaction is an immutable ledger entry.
type WalletTransaction struct {
	ID        uint         `gorm:"primaryKey;autoIncrement" json:"id"`
	WalletID  uint         `gorm:"not null;index"           json:"wallet_id"`
	Type      WalletTxType `gorm:"not null"                 json:"type"`
	Amount    float64      `gorm:"not null"                 json:"amount"`
	OrderID   *uint        `json:"order_id"`
	CreatedAt time.Time    `json:"created_at"`
}

// ─── Address ─────────────────────────────────────────────────────────────────

// Address is a saved delivery address for a Buyer.
type Address struct {
	gorm.Model
	BuyerID     uint   `gorm:"not null;index" json:"buyer_id"`
	Label       string `gorm:"not null"       json:"label"`
	FullAddress string `gorm:"not null"       json:"full_address"`
}

// ─── Discounts ───────────────────────────────────────────────────────────────

// Voucher has a usage limit and can expire.
// Vouchers and Promos cannot be combined on the same order.
type Voucher struct {
	gorm.Model
	Code         string    `gorm:"uniqueIndex;not null" json:"code"`
	DiscountRule string    `gorm:"not null"             json:"discount_rule"` // e.g. "percent:10" or "flat:50000"
	ExpiryDate   time.Time `gorm:"not null"             json:"expiry_date"`
	UsageLimit   int       `gorm:"not null;default:1"   json:"usage_limit"`
	UsageCount   int       `gorm:"not null;default:0"   json:"usage_count"`
}

// Promo has no usage limit, only an expiry.
type Promo struct {
	gorm.Model
	Code         string    `gorm:"uniqueIndex;not null" json:"code"`
	DiscountRule string    `gorm:"not null"             json:"discount_rule"`
	ExpiryDate   time.Time `gorm:"not null"             json:"expiry_date"`
}

// ─── Delivery ────────────────────────────────────────────────────────────────

// DeliveryJob tracks the driver assignment for an order.
// One order = one active driver, enforced via atomic conditional UPDATE.
type DeliveryJob struct {
	gorm.Model
	OrderID     uint        `gorm:"not null;uniqueIndex"     json:"order_id"`
	Order       Order       `gorm:"foreignKey:OrderID"       json:"order,omitempty"`
	DriverID    *uint       `json:"driver_id"`
	Driver      *User       `gorm:"foreignKey:DriverID"      json:"driver,omitempty"`
	Status      OrderStatus `gorm:"not null"                 json:"status"`
	TakenAt     *time.Time  `json:"taken_at"`
	CompletedAt *time.Time  `json:"completed_at"`
}

// ─── App Reviews ─────────────────────────────────────────────────────────────

// AppReview is a public review of the SEAPEDIA platform (not of a product/order).
// Guests (no account) may submit reviews — UserID is nullable.
type AppReview struct {
	gorm.Model
	ReviewerName string `gorm:"not null"       json:"reviewer_name"`
	Rating       int    `gorm:"not null"       json:"rating"`    // 1–5
	Comment      string `gorm:"not null"       json:"comment"`   // escaped before render
}
