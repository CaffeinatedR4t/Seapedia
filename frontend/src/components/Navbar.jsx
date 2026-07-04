import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Waves, ShoppingCart, Store, Truck, Settings, RefreshCw, LogOut, Home, ShoppingBag, Menu, X, ChevronDown, ChevronUp } from 'lucide-react'

const ROLE_CONFIG = {
  buyer:  { label: 'Pembeli',  color: 'badge-buyer',  icon: <ShoppingCart size={16} />, dash: '/buyer/dashboard' },
  seller: { label: 'Penjual',  color: 'badge-seller', icon: <Store size={16} />, dash: '/seller/dashboard' },
  driver: { label: 'Driver',   color: 'badge-driver', icon: <Truck size={16} />, dash: '/driver/dashboard' },
  admin:  { label: 'Admin',    color: 'badge-admin',  icon: <Settings size={16} />, dash: '/admin/dashboard' },
}

export default function Navbar() {
  const { isAuthenticated, user, activeRole, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const dropdownRef = useRef(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 10)
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setNavHidden(true)
      } else {
        setNavHidden(false)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
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
    const active = location.pathname === to || (to.includes('#') && location.hash === to.substring(to.indexOf('#')))
    const isAnchor = to.includes('#')
    const className = `relative group text-sm font-semibold transition-colors duration-150 py-1 ${
      active ? 'text-coral-600' : 'text-ink-700 hover:text-coral-600'
    }`

    const underline = <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-coral-600 transition-all duration-300 transform -translate-x-1/2 group-hover:w-full"></span>

    if (isAnchor) {
      return (
        <a href={to} className={className}>
          {label}
          {underline}
        </a>
      )
    }

    return (
      <Link
        to={to}
        className={className}
      >
        {label}
        {underline}
      </Link>
    )
  }

  const roleInfo = ROLE_CONFIG[activeRole]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-md'
    } border-b border-paper-200 ${navHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <motion.img 
              src="/images/seapedia_nobg.png" 
              alt="SEAPEDIA Logo" 
              className="w-8 h-8 object-contain origin-center"
              whileHover={{ scale: [1, 1.2, 1.1] }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    id="user-menu-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 btn-sm btn-secondary"
                  >
                    <div className="w-6 h-6 rounded-full bg-coral-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate text-sm">{user?.username}</span>
                    <span className="text-ink-500">{dropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                  </motion.button>

                  <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-52 card shadow-ocean-lg py-1 origin-top"
                    >
                      <div className="px-4 py-2 border-b border-paper-200">
                        <p className="text-xs text-ink-500">Masuk sebagai</p>
                        <p className="font-semibold text-ink-900 truncate">{user?.username}</p>
                      </div>

                      {roleInfo && (
                        <Link to={roleInfo.dash} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-paper-100 transition-colors">
                          <span>{roleInfo.icon}</span> Dashboard
                        </Link>
                      )}

                      {user?.roles?.length > 1 && (
                        <Link to="/role-selection" className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-paper-100 transition-colors">
                          <RefreshCw size={14} /> Ganti Peran
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> Keluar
                      </button>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="btn-md btn-secondary">Masuk</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="btn-md btn-primary">Daftar</Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 rounded-lg text-ink-700 hover:bg-paper-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-paper-200 bg-white animate-slide-up">
          <div className="px-4 py-3 flex flex-col gap-3">
            <Link to="/" className="text-ink-700 font-medium py-2 flex items-center gap-2"><Home size={18} /> Beranda</Link>
            <Link to="/products" className="text-ink-700 font-medium py-2 flex items-center gap-2"><ShoppingBag size={18} /> Produk</Link>

            {isAuthenticated ? (
              <>
                <div className="border-t border-paper-200 pt-3">
                  <p className="text-xs text-ink-500 mb-2">Masuk sebagai <strong>{user?.username}</strong></p>
                  {roleInfo && <Link to={roleInfo.dash} className="flex items-center gap-2 py-2 text-ink-700">{roleInfo.icon} Dashboard</Link>}
                  {user?.roles?.length > 1 && <Link to="/role-selection" className="flex items-center gap-2 py-2 text-ink-700"><RefreshCw size={18} /> Ganti Peran</Link>}
                  <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-red-600 w-full text-left"><LogOut size={18} /> Keluar</button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-paper-200">
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
