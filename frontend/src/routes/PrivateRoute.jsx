import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

/**
 * PrivateRoute — protects routes that require authentication.
 *
 * Props:
 *   requiredRole (string|undefined) — if set, also enforces the active role.
 *
 * Behavior:
 *   - Loading → show spinner
 *   - Not authenticated → redirect to /login (preserving intended location)
 *   - Authenticated, no active role, route requires role → redirect to /role-selection
 *   - Authenticated, wrong active role → redirect to /role-selection
 *   - All good → render <Outlet />
 */
export default function PrivateRoute({ requiredRole }) {
  const { isAuthenticated, activeRole, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role selection page itself doesn't need an active role
  if (requiredRole && activeRole !== requiredRole) {
    return <Navigate to="/role-selection" replace />
  }

  return <Outlet />
}
