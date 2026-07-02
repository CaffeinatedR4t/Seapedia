# SEAPEDIA
A fullstack e-commerce marketplace platform for the COMPFEST 18 Technical Challenge.

## Requirements Checklist and Documentation

### 1. Business Logic Rules
- **Single-store rule**: A buyer's cart can only contain products from a single store. If a buyer attempts to add a product from a different store, they must first clear their cart.
- **Discount combination rule**: Vouchers and Promos are mutually exclusive and cannot be combined on the same order. Currently, buyers can apply a Voucher code at checkout to calculate the discount.
- **PPN formula**: PPN is calculated as 12% of the total after discounts and delivery fees. Formula: `Tax = (Subtotal + Delivery Fee - Discount) * 0.12`
- **Driver earning rule**: Drivers earn the full `delivery_fee` for each completed delivery (`Pesanan Selesai`).
- **Overdue SLA**: Orders not picked up by a driver within their SLA will be automatically refunded and returned.
  - **Instant**: 1 day
  - **Next Day**: 2 days
  - **Regular**: 3 days

### 2. Time Simulation
To simulate the passage of time for SLA tests, an Admin endpoint is provided:
- **Endpoint**: `POST /api/v1/admin/simulate-overdue`
- **Action**: Simulates overdue checks. By default, it processes all overdue orders according to their specific SLAs. To forcefully process all orders with `Menunggu Pengirim` status for demonstration purposes, append `?force=true`.

### 3. Security Measures
- **SQLi Prevention**: All database queries are executed using GORM with parameterized inputs to prevent SQL Injection.
- **XSS Protection**: Public reviews are sanitized using `html.EscapeString` before being stored in the database.
- **Input Validation**: Request payloads are rigorously validated using Gin's data binding and validation tags.
- **RBAC**: Protected routes enforce Role-Based Access Control (RBAC). The active role is verified server-side via the JWT token claims.

### 4. Testing Guide
Demo data can be seeded using the following command from the `backend/` directory:
```bash
go run cmd/seed/main.go
```
This script populates the database with default accounts:
- **Admin**: `admin`
- **Seller**: `seller1`, `seller2`
- **Buyer**: `buyer1`, `buyer2`
- **Driver**: `driver1`

**Password for all demo accounts**: `password`

### 5. Running the Application
**Backend:**
```bash
cd backend
export DATABASE_URL="postgres://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
go run cmd/api/main.go
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
