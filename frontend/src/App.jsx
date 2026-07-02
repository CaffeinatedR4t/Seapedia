import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import LandingPage from './pages/LandingPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import StoreDetailPage from './pages/StoreDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import NotFoundPage from './pages/NotFoundPage'

import BuyerDashboard from './pages/dashboard/BuyerDashboard'
import SellerDashboard from './pages/dashboard/SellerDashboard'
import StoreManagementPage from './pages/dashboard/seller/StoreManagementPage'
import ProductManagementPage from './pages/dashboard/seller/ProductManagementPage'
import DriverDashboard from './pages/dashboard/DriverDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

import PrivateRoute from './routes/PrivateRoute'

// Layout with Navbar + Footer (public pages)
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

// Layout with only Navbar (dashboards — sidebar is inside each dashboard)
function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ──────────────────────────── */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
          <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
          <Route path="/stores/:id" element={<PublicLayout><StoreDetailPage /></PublicLayout>} />

          {/* ── Auth pages (no layout — full-screen) ───── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Role selection (needs auth, no specific role) */}
          <Route element={<PrivateRoute />}>
            <Route path="/role-selection" element={<RoleSelectionPage />} />
          </Route>

          {/* ── Protected dashboards ───────────────────── */}
          <Route element={<PrivateRoute requiredRole="buyer" />}>
            <Route path="/buyer/dashboard" element={<DashboardLayout><BuyerDashboard /></DashboardLayout>} />
          </Route>

          <Route element={<PrivateRoute requiredRole="seller" />}>
            <Route path="/seller/dashboard" element={<DashboardLayout><SellerDashboard /></DashboardLayout>} />
            <Route path="/seller/store" element={<DashboardLayout><StoreManagementPage /></DashboardLayout>} />
            <Route path="/seller/products" element={<DashboardLayout><ProductManagementPage /></DashboardLayout>} />
          </Route>

          <Route element={<PrivateRoute requiredRole="driver" />}>
            <Route path="/driver/dashboard" element={<DashboardLayout><DriverDashboard /></DashboardLayout>} />
          </Route>

          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
          </Route>

          {/* ── 404 ────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
