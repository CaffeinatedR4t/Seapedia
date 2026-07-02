package services

// Services package — transactional business logic.
//
// All checkout, refund, and take-job logic must be wrapped in:
//   db.Transaction(func(tx *gorm.DB) error { ... })
//
// Files planned:
//   checkout.go   — subtotal → discount → delivery fee → PPN 12% → total
//   wallet.go     — top-up, charge, refund (idempotent)
//   driver.go     — take-job (atomic conditional update, RowsAffected check)
//   overdue.go    — SLA sweep: auto-refund/return idempotently
