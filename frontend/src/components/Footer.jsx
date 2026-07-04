import { Link, useLocation } from 'react-router-dom'
import { Waves, Book, Camera, MessageCircle, Tv, ShoppingCart, Store, Truck } from 'lucide-react'

export default function Footer() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const waveColor = isHome ? 'text-coral-100' : 'text-paper-50'

  return (
    <footer className="bg-ink-900 text-paper-100">
      {/* Wave decoration */}
      <div className="overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className={`w-full ${waveColor} fill-current`} preserveAspectRatio="none" style={{ height: '40px' }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/seapedia_nobg.png" alt="SEAPEDIA Logo" className="w-9 h-9 object-contain bg-paper-50 rounded-full p-1" />
              <span className="text-xl font-extrabold text-white">SEAPEDIA</span>
            </div>
            <p className="text-coral-600 text-sm leading-relaxed">
              Marketplace laut terlengkap di Indonesia. Temukan semua yang kamu butuhkan untuk petualangan laut.
            </p>
            <div className="flex gap-3 mt-4">
              {[<Book size={16} />, <Camera size={16} />, <MessageCircle size={16} />, <Tv size={16} />].map((icon, i) => (
                <button key={i} className="w-8 h-8 rounded-full bg-ink-700 hover:bg-ink-500 flex items-center justify-center text-paper-100 transition-colors">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Jelajahi */}
          <div>
            <h4 className="text-white font-semibold mb-4">Jelajahi</h4>
            <ul className="space-y-2 text-sm text-coral-600">
              {[['/', 'Beranda'], ['/products', 'Produk'], ['/#reviews', 'Ulasan']].map(([to, label]) => (
                <li key={to}>
                  {to.includes('#') ? (
                    <a href={to} className="hover:text-white transition-colors">{label}</a>
                  ) : (
                    <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Akun */}
          <div>
            <h4 className="text-white font-semibold mb-4">Akun</h4>
            <ul className="space-y-2 text-sm text-coral-600">
              {[['/login', 'Masuk'], ['/register', 'Daftar']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Peran</h4>
            <ul className="space-y-2 text-sm text-coral-600">
              {[
                { label: 'Pembeli', desc: 'Belanja produk laut', icon: <ShoppingCart size={14} className="inline mr-1" /> },
                { label: 'Penjual', desc: 'Jual produkmu', icon: <Store size={14} className="inline mr-1" /> },
                { label: 'Driver', desc: 'Antar pesanan', icon: <Truck size={14} className="inline mr-1" /> }
              ].map(({ label, desc, icon }) => (
                <li key={label}>
                  <span className="block text-coral-600 font-medium">{icon}{label}</span>
                  <span className="text-xs">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-ink-500 text-sm">© {new Date().getFullYear()} SEAPEDIA. COMPFEST 18 - Software Engineering Academy.</p>
        </div>
      </div>
    </footer>
  )
}
