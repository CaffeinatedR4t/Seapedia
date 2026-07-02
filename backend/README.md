# SEAPEDIA Backend

Go + Gin + GORM + **Supabase (PostgreSQL)** API for the SEAPEDIA marketplace.

## Prerequisites

- Go 1.22+
- A [Supabase](https://supabase.com) project (free tier works)
- Docker & Docker Compose (optional, for local PostgreSQL fallback only)

## Quick Start

```bash
# 1. Copy and fill env vars with your Supabase credentials
cp .env.example .env
# Edit .env — set DATABASE_URL from Supabase Dashboard → Settings → Database → URI

# 2. Download Go dependencies
cd backend
go mod tidy

# 3. Run migrations & seed demo data
go run cmd/seed/main.go

# 4. Start the API server
go run cmd/api/main.go
# → http://localhost:8080/health
# → http://localhost:8080/swagger/index.html  (after swag init)
```

## Getting Your Supabase Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **Project Settings** → **Database**
3. Under **Connection String**, choose **URI** tab
4. Copy the string — it looks like:
   ```
   postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres
   ```
5. Append `?sslmode=require` — the backend requires SSL for Supabase
6. Paste into your `.env` as `DATABASE_URL`

> **Note:** Use port **5432** (direct connection) for the Go backend.
> Supabase free tier allows ~60 simultaneous connections — the backend is
> pre-configured with a small pool (max 10) to stay within this limit.

## Local PostgreSQL (Offline Fallback)

If you need to develop without Supabase access:

```bash
docker compose up -d db
# Then in .env, use:
# DATABASE_URL=postgres://seapedia:secret@localhost:5432/seapedia?sslmode=disable
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Full Supabase PostgreSQL URI | `postgres://postgres:pw@db.xyz.supabase.co:5432/postgres?sslmode=require` |
| `JWT_SECRET` | Secret key for signing JWTs (keep long & random in prod) | `supersecretkey` |
| `GIN_MODE` | Gin mode | `debug` / `release` |
| `PORT` | Server port (default 8080) | `8080` |

## Demo Accounts (after `go run cmd/seed/main.go`)

| Username | Password | Role(s) | Notes |
|---|---|---|---|
| admin | admin123 | Admin | Admin-only access |
| seller1 | seller123 | Seller | Store: "Toko Satu" |
| seller2 | seller123 | Seller | Store: "Toko Dua" |
| buyer1 | buyer123 | Buyer | Wallet: Rp 500.000 |
| buyer2 | buyer123 | Buyer | Wallet: Rp 250.000 |
| driver1 | driver123 | Driver | — |

## Business Rules Summary

### Checkout Formula
```
subtotal    = Σ (item.price × item.qty)
discount    = voucher or promo amount (applied to subtotal)
taxBase     = (subtotal - discount) + deliveryFee
ppn         = taxBase × 12%
total       = taxBase + ppn
```

### Cart Rule — Single Store Only
One cart holds products from **one store only**. Adding a product from a different
store is rejected — the buyer must clear the cart first.

### Discount Combination Rule
Vouchers and Promos **cannot be combined** on the same order.
Only one discount code may be applied per checkout.

### Delivery Methods & SLA
| Method | Fee | Overdue SLA |
|---|---|---|
| Instant | Rp 15.000 | 1 day |
| Next Day | Rp 10.000 | 2 days |
| Regular | Rp 5.000 | 5 days |

### Driver Earning Formula
Driver earns **100% of the delivery fee** from the completed order.

### Overdue Auto-Refund
When an order misses its SLA:
1. Status → `Dikembalikan`
2. Full `total` refunded to Buyer wallet (logged in `WalletTransaction`)
3. Seller income for that order reversed (if already recorded)
4. Product stock restored per `OrderItem` quantities
5. Operation is **idempotent** — safe to re-run on the same order

### Simulating Time
Use `POST /api/v1/admin/simulate-next-day` (Admin role required) to advance the
system clock by 1 day and trigger the overdue sweep.

### Creating the Admin Account
Admin accounts are created by the seed script:
```bash
go run cmd/seed/main.go
```
In production, run the seed directly against your Supabase DB (set `DATABASE_URL` first).

## Generate Swagger Docs

```bash
# Install swag CLI (once)
go install github.com/swaggo/swag/cmd/swag@latest

# Generate from handler annotations (run from backend/)
swag init -g cmd/api/main.go -o docs/
```

Then visit `http://localhost:8080/swagger/index.html`.

## Security Notes

- **SQL Injection:** All DB access uses GORM parameterized queries (`Where("x = ?", val)`). No `fmt.Sprintf` string-concatenated SQL.
- **XSS:** User-generated content (app reviews, comments) is escaped before rendering. React escapes by default; any `dangerouslySetInnerHTML` usage is explicitly avoided.
- **Input Validation:** All form inputs are validated (types, ranges, required fields) before hitting the DB.
- **Auth:** JWT tokens are signed with `HS256`. Tokens expire after 24h. Active role is encoded in JWT claims and verified server-side on every protected request.
- **RBAC:** Role is never trusted from the frontend — middleware re-validates the active role from the JWT on every request.
