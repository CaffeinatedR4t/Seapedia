import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_CONFIG = {
  buyer:  { label: 'Pembeli',  color: 'badge-buyer',  icon: '🛒', dash: '/buyer/dashboard' },
  seller: { label: 'Penjual',  color: 'badge-seller', icon: '🏪', dash: '/seller/dashboard' },
  driver: { label: 'Driver',   color: 'badge-driver', icon: '🚚', dash: '/driver/dashboard' },
  admin:  { label: 'Admin',    color: 'badge-admin',  icon: '⚙️', dash: '/admin/dashboard' },
}

export default function Navbar() {
  const { isAuthenticated, user, activeRole, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false); setDropdownOpen(false) }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLink = (to, label) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors duration-150 ${
          active ? 'text-sky-600' : 'text-slate-600 hover:text-sky-600'
        }`}
      >
        {label}
      </Link>
    )
  }

  const roleInfo = ROLE_CONFIG[activeRole]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-md'
    } border-b border-sky-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌊</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-sky-700 to-cyan-600 bg-clip-text text-transparent">
              SEAPEDIA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLink('/', 'Beranda')}
            {navLink('/products', 'Produk')}
            {navLink('/#reviews', 'Ulasan')}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Active Role Badge */}
                {roleInfo && (
                  <Link to={roleInfo.dash} className={`${roleInfo.color} flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity`}>
                    <span>{roleInfo.icon}</span>
                    <span>{roleInfo.label}</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    id="user-menu-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 btn-sm btn-secondary"
                  >
                    <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate text-sm">{user?.username}</span>
                    <span className="text-slate-400 text-xs">{dropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 card shadow-ocean-lg py-1 animate-slide-up">
                      <div className="px-4 py-2 border-b border-sky-50">
                        <p className="text-xs text-slate-500">Masuk sebagai</p>
                        <p className="font-semibold text-slate-800 truncate">{user?.username}</p>
                      </div>

                      {roleInfo && (
                        <Link to={roleInfo.dash} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 transition-colors">
                          <span>{roleInfo.icon}</span> Dashboard
                        </Link>
                      )}

                      {user?.roles?.length > 1 && (
                        <Link to="/role-selection" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 transition-colors">
                          <span>🔄</span> Ganti Peran
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span>🚪</span> Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-md btn-secondary">Masuk</Link>
                <Link to="/register" className="btn-md btn-primary">Daftar</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-sky-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-sky-100 bg-white animate-slide-up">
          <div className="px-4 py-3 flex flex-col gap-3">
            <Link to="/" className="text-slate-700 font-medium py-2">🏠 Beranda</Link>
            <Link to="/products" className="text-slate-700 font-medium py-2">🛍️ Produk</Link>

            {isAuthenticated ? (
              <>
                <div className="border-t border-sky-100 pt-3">
                  <p className="text-xs text-slate-500 mb-2">Masuk sebagai <strong>{user?.username}</strong></p>
                  {roleInfo && <Link to={roleInfo.dash} className="block py-2 text-slate-700">{roleInfo.icon} Dashboard</Link>}
                  {user?.roles?.length > 1 && <Link to="/role-selection" className="block py-2 text-slate-700">🔄 Ganti Peran</Link>}
                  <button onClick={handleLogout} className="block py-2 text-red-600 w-full text-left">🚪 Keluar</button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-sky-100">
                <Link to="/login" className="btn-md btn-secondary w-full text-center">Masuk</Link>
                <Link to="/register" className="btn-md btn-primary w-full text-center">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
