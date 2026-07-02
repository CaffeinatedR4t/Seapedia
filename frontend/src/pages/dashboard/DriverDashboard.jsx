import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function DriverDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <aside className="w-64 min-h-screen bg-white border-r border-amber-100 flex-shrink-0">
        <div className="p-6 border-b border-amber-100">
          <span className="badge-driver text-sm py-1">🚚 Driver</span>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { icon: '📊', label: 'Dashboard', to: '/driver/dashboard', disabled: false },
            { icon: '🗺️', label: 'Cari Pekerjaan', to: '/driver/jobs', disabled: true },
            { icon: '📋', label: 'Pekerjaan Saya', to: '/driver/my-jobs', disabled: true },
            { icon: '💰', label: 'Penghasilan', to: '/driver/earnings', disabled: true },
          ].map(({ icon, label, to, disabled }) =>
            disabled ? (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed text-sm">
                <span>{icon}</span>{label}<span className="ml-auto text-xs">(Coming)</span>
              </div>
            ) : (
              <Link key={label} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm">
                <span>{icon}</span>{label}
              </Link>
            )
          )}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Selamat datang, {user?.username}! 🚚</h1>
        <p className="text-slate-500 mb-8">Dashboard Driver — cari dan selesaikan pekerjaan pengiriman</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Pekerjaan Aktif', value: '0', icon: '🗺️', color: 'from-amber-500 to-orange-500' },
            { label: 'Selesai Minggu Ini', value: '0', icon: '✅', color: 'from-emerald-500 to-teal-500' },
            { label: 'Total Penghasilan', value: 'Rp 0', icon: '💰', color: 'from-sky-500 to-cyan-500' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg`}>{icon}</div>
                <div><p className="text-xs text-slate-500">{label}</p><p className="font-bold text-slate-800">{value}</p></div>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-3">🔒 Tersedia di Level 5</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: '🗺️ Cari Pekerjaan', desc: 'Lihat daftar pengiriman yang tersedia', level: 'Level 5' },
            { title: '📋 Pekerjaan Saya', desc: 'Kelola pekerjaan aktif dan riwayat pengiriman', level: 'Level 5' },
            { title: '💰 Penghasilan', desc: 'Pantau penghasilan dari setiap pengiriman', level: 'Level 5' },
            { title: '🏅 Statistik', desc: 'Lihat performa dan rating drivermu', level: 'Level 5' },
          ].map(({ title, desc, level }) => (
            <div key={title} className="card p-6 border-dashed">
              <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 mb-3">{desc}</p>
              <span className="badge bg-amber-100 text-amber-600">🔓 Coming: {level}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          {user?.roles?.length > 1 && <Link to="/role-selection" className="btn-md btn-secondary">🔄 Ganti Peran</Link>}
          <button onClick={() => { logout(); navigate('/') }} className="btn-md btn-ghost text-red-500">🚪 Keluar</button>
        </div>
      </main>
    </div>
  )
}
