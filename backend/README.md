# SEAPEDIA Backend

Go + Gin + GORM + PostgreSQL API for the SEAPEDIA marketplace.

## Prerequisites

- Go 1.22+
- PostgreSQL 15+
- Docker & Docker Compose (optional, for local DB)

## Quick Start

```bash
# 1. Start PostgreSQL via Docker
docker compose up -d db

# 2. Copy and fill env vars
cp .env.example .env

# 3. Download Go dependencies
go mod tidy

# 4. Run migrations & seed demo data
go run cmd/seed/main.go

# 5. Start the API server
go run cmd/api/main.go
# → http://localhost:8080/health
# → http://localhost:8080/swagger/index.html  (after swag init)
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL DSN | `postgres://seapedia:secret@localhost:5432/seapedia?sslmode=disable` |
| `JWT_SECRET` | Secret key for signing JWTs | `supersecretkey` |
| `GIN_MODE` | Gin mode | `debug` / `release` |
| `PORT` | Server port (default 8080) | `8080` |

## Demo Accounts (after `go run cmd/seed/main.go`)

| Username | Password | Role(s) |
|---|---|---|
| admin | admin123 | Admin |
| seller1 | seller123 | Seller (Store: "Toko Satu") |
| seller2 | seller123 | Seller (Store: "Toko Dua") |
| buyer1 | buyer123 | Buyer (Wallet: Rp 500.000) |
| buyer2 | buyer123 | Buyer (Wallet: Rp 250.000) |
| driver1 | driver123 | Driver |

## Business Rules Summary

### Checkout Formula
```
subtotal = sum(item.price × item.qty)
discount = voucher or promo amount (applied to subtotal)
deliveryFee = per delivery method (Instant / Next Day / Regular)
taxBase = (subtotal - discount) + deliveryFee
ppn = taxBase × 12%
total = taxBase + ppn
```

### Cart Rule
One cart holds products from **one store only**. Adding a product from a different store will be rejected — the buyer must clear the cart first.

### Delivery Methods & SLA
| Method | Fee | Overdue SLA |
|---|---|---|
| Instant | Rp 15.000 | 1 day |
| Next Day | Rp 10.000 | 2 days |
| Regular | Rp 5.000 | 5 days |

### Discount Combination Rule
Vouchers and Promos **cannot** be combined on the same order. Only one discount code may be applied per checkout.

### Driver Earning Formula
Driver earns the delivery fee of the completed order (100% of deliveryFee goes to driver).

### Overdue Auto-Refund
When an order misses its SLA:
1. Order status → `Dikembalikan`
2. Buyer wallet is refunded the full `total` paid
3. Seller income for that order is reversed (if already recorded)
4. Product stock is restored
5. Operation is **idempotent** — safe to re-run on the same order

### Simulating Time
Use `POST /api/v1/admin/simulate-next-day` (Admin role required) to advance the system clock by 1 day. This triggers the overdue sweep.

### Creating the First Admin Account
The admin account is created by the seed script (`go run cmd/seed/main.go`). In production, set `ADMIN_SEED=true` env var and restart, or run the seed directly against the production DB.

## Generate Swagger Docs

```bash
# Install swag CLI (once)
go install github.com/swaggo/swag/cmd/swag@latest

# Generate from handler annotations
swag init -g cmd/api/main.go -o docs/
```

Then visit `http://localhost:8080/swagger/index.html`.
