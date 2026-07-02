package middleware

// Middleware package — handlers for auth, role enforcement, and error responses.
//
// Planned middleware (implemented per level):
//   - AuthMiddleware()     — validates JWT, injects claims into Gin context
//   - RequireRole(role)    — verifies the active role in the JWT claim
//   - ErrorHandler()       — maps service errors to consistent JSON responses
