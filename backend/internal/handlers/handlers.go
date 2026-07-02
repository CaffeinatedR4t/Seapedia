package handlers

// Handlers package — thin HTTP handlers per feature domain.
//
// Each handler file should:
//   1. Parse & validate the HTTP request
//   2. Call the appropriate service function
//   3. Map errors to HTTP status codes and return JSON
//
// Files planned (one per feature area):
//   auth.go, product.go, order.go, cart.go,
//   wallet.go, driver.go, admin.go, review.go
