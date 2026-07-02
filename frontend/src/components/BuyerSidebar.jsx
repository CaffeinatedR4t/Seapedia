import { Link } from 'react-router-dom'

const BUYER_NAV = [
  { icon: '📊', label: 'Dashboard', to: '/buyer/dashboard' },
  { icon: '💰', label: 'Dompet', to: '/buyer/wallet' },
  { icon: '🛒', label: 'Keranjang', to: '/buyer/cart' },
  { icon: '📦', label: 'Pesanan', to: '/buyer/orders' },
  { icon: '📍', label: 'Alamat', to: '/buyer/address' },
]

export default function BuyerSidebar() {
  return (
    <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-sky-100 flex-shrink-0">
      <div className="p-6 border-b border-sky-100">
        <span className="badge-buyer text-sm py-1">🛒 Pembeli</span>
      </div>
      <nav className="p-4 space-y-1">
        {BUYER_NAV.map(({ icon, label, to, disabled }) => (
          disabled ? (
            <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed text-sm">
              <span>{icon}</span>{label} <span className="ml-auto text-xs">(Coming)</span>
            </div>
          ) : (
            <Link key={label} to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors text-sm">
              <span>{icon}</span>{label}
            </Link>
          )
        ))}
      </nav>
    </aside>
  )
}
