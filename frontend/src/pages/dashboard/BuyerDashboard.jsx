import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Sidebar({ items, title }) {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-sky-100 flex-shrink-0">
      <div className="p-6 border-b border-sky-100">
        <span className="badge-buyer text-sm py-1">{title}</span>
      </div>
      <nav className="p-4 space-y-1">
        {items.map(({ icon, label, to, disabled }) => (
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

const BUYER_NAV = [
  { icon: '📊', label: 'Dashboard', to: '/buyer/dashboard' },
  { icon: '💰', label: 'Dompet', to: '/buyer/wallet', disabled: true },
  { icon: '🛒', label: 'Keranjang', to: '/buyer/cart', disabled: true },
  { icon: '📦', label: 'Pesanan', to: '/buyer/orders', disabled: true },
  { icon: '📍', label: 'Alamat', to: '/buyer/address', disabled: true },
]

export default function BuyerDashboard() {
  const { user, logout, selectRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <Sidebar items={BUYER_NAV} title="🛒 Pembeli" />

      <main className="flex-1 p-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Selamat datang, {user?.username}! 👋</h1>
          <p className="text-slate-500 mt-1">Ini adalah dashboard Pembeli kamu</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Saldo Dompet', value: 'Rp 0', icon: '💰', color: 'from-sky-500 to-cyan-500', note: 'Level 3' },
            { label: 'Total Pesanan', value: '0', icon: '📦', color: 'from-indigo-500 to-sky-500', note: 'Level 3' },
            { label: 'Keranjang', value: '0 item', icon: '🛒', color: 'from-teal-500 to-emerald-500', note: 'Level 3' },
          ].map(({ label, value, icon, color, note }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg`}>{icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-bold text-slate-800">{value}</p>
                </div>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">🔒 Tersedia di {note}</p>
            </div>
          ))}
        </div>

        {/* Coming Soon Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: '💰 Dompet & Top-Up', desc: 'Kelola saldo dan riwayat transaksi wallet-mu', level: 'Level 3' },
            { title: '🛒 Keranjang Belanja', desc: 'Lihat produk yang sudah ditambah ke keranjang', level: 'Level 3' },
            { title: '📦 Riwayat Pesanan', desc: 'Pantau status pengiriman pesananmu', level: 'Level 3' },
            { title: '📍 Alamat Pengiriman', desc: 'Kelola alamat pengiriman favoritmu', level: 'Level 3' },
          ].map(({ title, desc, level }) => (
            <div key={title} className="card p-6 border-dashed">
              <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 mb-3">{desc}</p>
              <span className="badge bg-sky-100 text-sky-600">🔓 Coming: {level}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-3">
          {user?.roles?.length > 1 && (
            <Link to="/role-selection" className="btn-md btn-secondary">🔄 Ganti Peran</Link>
          )}
          <button onClick={handleLogout} className="btn-md btn-ghost text-red-500">🚪 Keluar</button>
        </div>
      </main>
    </div>
  )
}
