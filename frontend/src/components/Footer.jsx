import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-sky-900 text-sky-100">
      {/* Wave decoration */}
      <div className="overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full text-sky-50 fill-current" preserveAspectRatio="none" style={{ height: '40px' }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌊</span>
              <span className="text-xl font-extrabold text-white">SEAPEDIA</span>
            </div>
            <p className="text-sky-300 text-sm leading-relaxed">
              Marketplace laut terlengkap di Indonesia. Temukan semua yang kamu butuhkan untuk petualangan laut.
            </p>
            <div className="flex gap-3 mt-4">
              {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
                <button key={i} className="w-8 h-8 rounded-full bg-sky-800 hover:bg-sky-700 flex items-center justify-center text-sm transition-colors">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Jelajahi */}
          <div>
            <h4 className="text-white font-semibold mb-4">Jelajahi</h4>
            <ul className="space-y-2 text-sm text-sky-300">
              {[['/', 'Beranda'], ['/products', 'Produk'], ['/#reviews', 'Ulasan']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Akun */}
          <div>
            <h4 className="text-white font-semibold mb-4">Akun</h4>
            <ul className="space-y-2 text-sm text-sky-300">
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
            <ul className="space-y-2 text-sm text-sky-300">
              {[['🛒 Pembeli', 'Belanja produk laut'], ['🏪 Penjual', 'Jual produkmu'], ['🚚 Driver', 'Antar pesanan']].map(([role, desc]) => (
                <li key={role}>
                  <span className="block text-sky-200 font-medium">{role}</span>
                  <span className="text-xs">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-sky-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sky-400 text-sm">© 2024 SEAPEDIA. COMPFEST 18 — Software Engineering Academy.</p>
          <p className="text-sky-500 text-xs">Dibuat dengan 🌊 dan ☕</p>
        </div>
      </div>
    </footer>
  )
}
