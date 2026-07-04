import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Package, Store as StoreIcon, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CommandPalette({ isOpen, setIsOpen }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsOpen])

  if (!isOpen) return null

  const items = [
    { name: 'Produk Laut', icon: <Package size={18} />, route: '/products' },
    { name: 'Toko Penjual', icon: <StoreIcon size={18} />, route: '/' },
    { name: 'Masuk / Login', icon: <HelpCircle size={18} />, route: '/login' },
    { name: 'Daftar Baru', icon: <HelpCircle size={18} />, route: '/register' },
  ]

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))

  const handleSelect = (route) => {
    setIsOpen(false)
    navigate(route)
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-slate-900/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center px-4 py-3 border-b border-slate-100">
            <Search className="text-slate-400" size={20} />
            <input
              type="text"
              autoFocus
              className="flex-1 px-3 py-2 bg-transparent text-slate-800 placeholder-slate-400 outline-none text-lg"
              placeholder="Cari menu atau navigasi..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="p-1 rounded-md text-slate-400 hover:bg-slate-100" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredItems.length > 0 ? (
              <ul className="space-y-1">
                {filteredItems.map((item, idx) => (
                  <li key={idx}>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                      onClick={() => handleSelect(item.route)}
                    >
                      <span className="text-slate-400">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Search className="mx-auto mb-3 opacity-20" size={32} />
                <p>Tidak menemukan "{query}"</p>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Gunakan panah untuk navigasi</span>
            <span className="flex items-center gap-1">
              Tekan <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono shadow-sm">esc</kbd> untuk tutup
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
