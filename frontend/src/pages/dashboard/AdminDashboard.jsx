import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <aside className="w-64 min-h-screen bg-white border-r border-purple-100 flex-shrink-0">
        <div className="p-6 border-b border-purple-100">
          <span className="badge-admin text-sm py-1">⚙️ Admin</span>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { icon: '📊', label: 'Dashboard', to: '/admin/dashboard' },
            { icon: '👥', label: 'Pengguna', to: '/admin/users', disabled: true },
            { icon: '🏪', label: 'Toko', to: '/admin/stores', disabled: true },
            { icon: '📦', label: 'Produk', to: '/admin/products', disabled: true },
            { icon: '🧾', label: 'Pesanan', to: '/admin/orders', disabled: true },
            { icon: '🎟️', label: 'Voucher', to: '/admin/vouchers', disabled: true },
            { icon: '🏷️', label: 'Promo', to: '/admin/promos', disabled: true },
            { icon: '🚚', label: 'Pengiriman', to: '/admin/deliveries', disabled: true },
            { icon: '⏰', label: 'Overdue', to: '/admin/overdue', disabled: true },
          ].map(({ icon, label, to, disabled }) =>
            disabled ? (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed text-sm">
                <span>{icon}</span>{label}<span className="ml-auto text-xs">(Coming)</span>
              </div>
            ) : (
              <Link key={label} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm">
                <span>{icon}</span>{label}
              </Link>
            )
          )}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Panel ⚙️</h1>
        <p className="text-slate-500 mb-8">Monitor dan kelola seluruh ekosistem SEAPEDIA</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pengguna', icon: '👥', color: 'from-purple-500 to-indigo-500' },
            { label: 'Total Toko', icon: '🏪', color: 'from-emerald-500 to-teal-500' },
            { label: 'Total Pesanan', icon: '🧾', color: 'from-sky-500 to-cyan-500' },
            { label: 'Pesanan Overdue', icon: '⏰', color: 'from-red-500 to-orange-500' },
          ].map(({ label, icon, color }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg mx-auto mb-2`}>{icon}</div>
              <p className="font-bold text-2xl text-slate-800">—</p>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xs text-purple-600 bg-purple-50 rounded mt-2 px-1">Level 6</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { title: '👥 Monitoring Pengguna', desc: 'Lihat semua pengguna dan perannya', level: 'Level 6' },
            { title: '🎟️ Kelola Voucher', desc: 'Buat dan kelola kode voucher diskon', level: 'Level 6' },
            { title: '🏷️ Kelola Promo', desc: 'Buat dan kelola promo spesial', level: 'Level 6' },
            { title: '⏰ Penanganan Overdue', desc: 'Proses otomatis pesanan kedaluwarsa', level: 'Level 6' },
            { title: '📅 Simulasi Waktu', desc: 'Simulasikan hari berikutnya untuk demo', level: 'Level 6' },
            { title: '🚚 Monitor Pengiriman', desc: 'Pantau semua pekerjaan driver', level: 'Level 6' },
          ].map(({ title, desc, level }) => (
            <div key={title} className="card p-5 border-dashed">
              <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 mb-2">{desc}</p>
              <span className="badge bg-purple-100 text-purple-600">🔓 Coming: {level}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button onClick={() => { logout(); navigate('/') }} className="btn-md btn-ghost text-red-500">🚪 Keluar</button>
        </div>
      </main>
    </div>
  )
}
