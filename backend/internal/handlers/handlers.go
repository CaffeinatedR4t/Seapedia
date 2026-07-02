// Package handlers contains HTTP handlers for the SEAPEDIA API.
// Each file in this package handles one feature domain (auth, product, review, etc.).
// Handlers are thin: parse+validate input, call a service, map errors to HTTP status codes.
package handlers
