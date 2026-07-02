import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

const ROLE_CONFIG = {
  buyer:  { icon: '🛒', label: 'Pembeli',  desc: 'Belanja produk, kelola keranjang & checkout',  color: 'from-sky-500 to-cyan-500',      border: 'border-sky-400',   bg: 'hover:bg-sky-50',    dash: '/buyer/dashboard' },
  seller: { icon: '🏪', label: 'Penjual',  desc: 'Kelola toko, produk, & lihat pesanan masuk',   color: 'from-emerald-500 to-teal-500',  border: 'border-emerald-400', bg: 'hover:bg-emerald-50', dash: '/seller/dashboard' },
  driver: { icon: '🚚', label: 'Driver',   desc: 'Cari & ambil pekerjaan pengiriman',             color: 'from-amber-500 to-orange-500',  border: 'border-amber-400', bg: 'hover:bg-amber-50',  dash: '/driver/dashboard' },
  admin:  { icon: '⚙️', label: 'Admin',    desc: 'Monitor marketplace & kelola sistem',            color: 'from-purple-500 to-indigo-500', border: 'border-purple-400', bg: 'hover:bg-purple-50', dash: '/admin/dashboard' },
}

export default function RoleSelectionPage() {
  const { user, selectRole } = useAuth()
  const navigate = useNavigate()
  const [selecting, setSelecting] = useState(null)
  const [error, setError] = useState('')

  const userRoles = user?.roles || []

  const handleSelect = async (role) => {
    setError('')
    setSelecting(role)
    try {
      const res = await client.post('/auth/select-role', { role })
      selectRole(res.data.token, role)
      navigate(ROLE_CONFIG[role]?.dash || '/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memilih peran. Coba lagi.')
      setSelecting(null)
    }
  }

  if (!user) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-800 to-cyan-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🌊</span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Pilih Peran Aktif</h1>
          <p className="text-sky-200 mt-2">
            Halo, <span className="font-semibold text-white">{user.username}</span>!
            Kamu memiliki beberapa peran. Pilih peran untuk sesi ini.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-400/30 rounded-xl text-red-300 text-sm text-center">
            ⚠ {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userRoles.map((role) => {
            const cfg = ROLE_CONFIG[role]
            if (!cfg) return null
            const isSelecting = selecting === role

            return (
              <button
                key={role}
                id={`select-role-${role}`}
                onClick={() => handleSelect(role)}
                disabled={!!selecting}
                className={`
                  card-hover p-6 text-left border-2 transition-all duration-200
                  ${selecting ? 'opacity-60' : `${cfg.border} ${cfg.bg}`}
                  ${isSelecting ? 'ring-2 ring-white scale-95' : ''}
                  cursor-pointer group
                `}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-2xl mb-4 shadow-ocean group-hover:scale-110 transition-transform`}>
                  {isSelecting ? <LoadingSpinner size="sm" /> : cfg.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{cfg.label}</h3>
                <p className="text-sm text-slate-500">{cfg.desc}</p>
                <div className="mt-4 flex items-center text-sky-600 text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                  Pilih peran ini <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-center text-sky-300 text-xs mt-8">
          Kamu bisa ganti peran kapan saja dari menu profil
        </p>
      </div>
    </div>
  )
}
