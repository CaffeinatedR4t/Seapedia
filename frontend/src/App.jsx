import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import CommandPalette from './components/CommandPalette'

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
import WalletPage from './pages/dashboard/buyer/WalletPage'
import AddressPage from './pages/dashboard/buyer/AddressPage'
import CartPage from './pages/dashboard/buyer/CartPage'
import OrderHistoryPage from './pages/dashboard/buyer/OrderHistoryPage'
import OrderDetailPage from './pages/dashboard/buyer/OrderDetailPage'
import CheckoutPage from './pages/dashboard/buyer/CheckoutPage'

import SellerDashboard from './pages/dashboard/SellerDashboard'
import SellerReports from './pages/dashboard/SellerReports'
import StoreManagementPage from './pages/dashboard/seller/StoreManagementPage'
import ProductManagementPage from './pages/dashboard/seller/ProductManagementPage'
import SellerOrdersPage from './pages/dashboard/seller/SellerOrdersPage'
import DriverDashboard from './pages/dashboard/DriverDashboard'
import AvailableJobsPage from './pages/dashboard/driver/AvailableJobsPage'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import AdminPromosPage from './pages/dashboard/admin/AdminPromosPage'
import AdminSimulatePage from './pages/dashboard/admin/AdminSimulatePage'

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

// Layout with only Navbar (dashboards - sidebar is inside each dashboard)
function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function App() {
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      wheelMultiplier: 1,
    })
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} />
        <Routes>
          {/* ── Public routes ──────────────────────────── */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
          <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
          <Route path="/stores/:id" element={<PublicLayout><StoreDetailPage /></PublicLayout>} />

          {/* -- Auth pages (no layout - full-screen) ----- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Role selection (needs auth, no specific role) */}
          <Route element={<PrivateRoute />}>
            <Route path="/role-selection" element={<RoleSelectionPage />} />
          </Route>

          {/* ── Protected dashboards ───────────────────── */}
          <Route element={<PrivateRoute requiredRole="buyer" />}>
            <Route path="/buyer/dashboard" element={<DashboardLayout><BuyerDashboard /></DashboardLayout>} />
            <Route path="/buyer/wallet" element={<DashboardLayout><WalletPage /></DashboardLayout>} />
            <Route path="/buyer/address" element={<DashboardLayout><AddressPage /></DashboardLayout>} />
            <Route path="/buyer/cart" element={<DashboardLayout><CartPage /></DashboardLayout>} />
            <Route path="/buyer/checkout" element={<DashboardLayout><CheckoutPage /></DashboardLayout>} />
            <Route path="/buyer/orders" element={<DashboardLayout><OrderHistoryPage /></DashboardLayout>} />
            <Route path="/buyer/orders/:id" element={<DashboardLayout><OrderDetailPage /></DashboardLayout>} />
          </Route>

          <Route element={<PrivateRoute requiredRole="seller" />}>
            <Route path="/seller/dashboard" element={<DashboardLayout><SellerDashboard /></DashboardLayout>} />
            <Route path="/seller/store" element={<DashboardLayout><StoreManagementPage /></DashboardLayout>} />
            <Route path="/seller/products" element={<DashboardLayout><ProductManagementPage /></DashboardLayout>} />
            <Route path="/seller/orders" element={<DashboardLayout><SellerOrdersPage /></DashboardLayout>} />
            <Route path="/seller/reports" element={<DashboardLayout><SellerReports /></DashboardLayout>} />
          </Route>

          <Route element={<PrivateRoute requiredRole="driver" />}>
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/available" element={<AvailableJobsPage />} />
          </Route>

          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
            <Route path="/admin/promos" element={<DashboardLayout><AdminPromosPage /></DashboardLayout>} />
            <Route path="/admin/simulate" element={<DashboardLayout><AdminSimulatePage /></DashboardLayout>} />
          </Route>

          {/* ── 404 ────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
