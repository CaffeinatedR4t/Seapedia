import { Link } from 'react-router-dom'

const SELLER_NAV = [
  { icon: '📊', label: 'Dashboard', to: '/seller/dashboard' },
  { icon: '🏪', label: 'Toko Saya', to: '/seller/store' },
  { icon: '📦', label: 'Produk', to: '/seller/products' },
  { icon: '🧾', label: 'Pesanan Masuk', to: '/seller/orders' },
  { icon: '💹', label: 'Laporan', to: '/seller/reports', disabled: true },
]

export default function SellerSidebar() {
  return (
    <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-emerald-100 flex-shrink-0">
      <div className="p-6 border-b border-emerald-100">
        <span className="badge-seller text-sm py-1">🏪 Penjual</span>
      </div>
      <nav className="p-4 space-y-1">
        {SELLER_NAV.map(({ icon, label, to, disabled }) =>
          disabled ? (
            <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed text-sm">
              <span>{icon}</span>{label}<span className="ml-auto text-xs">(Coming)</span>
            </div>
          ) : (
            <Link key={label} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm">
              <span>{icon}</span>{label}
            </Link>
          )
        )}
      </nav>
    </aside>
  )
}
