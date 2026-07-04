import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Ticket, Clock, Shield } from 'lucide-react'

const ADMIN_NAV = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: <Ticket size={20} />, label: 'Promo & Voucher', to: '/admin/promos' },
  { icon: <Clock size={20} />, label: 'Simulasi Overdue', to: '/admin/simulate' },
]

export default function AdminSidebar() {
  const { pathname } = useLocation()
  const { logout, user } = useAuth()

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl text-coral-600 mr-1"><Shield size={24} /></span> Admin Panel
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {ADMIN_NAV.map(item => (
          <Link
            key={item.to}
            to={item.disabled ? '#' : item.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              item.disabled 
                ? 'opacity-50 cursor-not-allowed text-slate-500' 
                : pathname.startsWith(item.to)
                  ? 'bg-sky-500/10 text-sky-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.username}</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          Keluar
        </button>
      </div>
    </aside>
  )
}
