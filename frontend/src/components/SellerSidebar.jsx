import { Link } from 'react-router-dom'
import { LayoutDashboard, Store as StoreIcon, Package, Receipt, TrendingUp } from 'lucide-react'

const SELLER_NAV = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/seller/dashboard' },
  { icon: <StoreIcon size={20} />, label: 'Toko Saya', to: '/seller/store' },
  { icon: <Package size={20} />, label: 'Produk', to: '/seller/products' },
  { icon: <Receipt size={20} />, label: 'Pesanan Masuk', to: '/seller/orders' },
  { icon: <TrendingUp size={20} />, label: 'Laporan', to: '/seller/reports' },
]

export default function SellerSidebar() {
  return (
    <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-emerald-100 flex-shrink-0">
      <div className="p-6 border-b border-emerald-100">
        <span className="badge-seller text-sm py-1 inline-flex items-center gap-1"><StoreIcon size={14} /> Penjual</span>
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
