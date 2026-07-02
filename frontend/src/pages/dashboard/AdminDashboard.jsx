import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import client from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex bg-slate-50 min-h-screen"><AdminSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  const metrics = [
    { label: 'Pengguna', value: stats?.users || 0, icon: '👥', color: 'bg-blue-100 text-blue-700' },
    { label: 'Toko', value: stats?.stores || 0, icon: '🏪', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Produk', value: stats?.products || 0, icon: '📦', color: 'bg-amber-100 text-amber-700' },
    { label: 'Pesanan', value: stats?.orders || 0, icon: '🧾', color: 'bg-purple-100 text-purple-700' },
    { label: 'Voucher', value: stats?.vouchers || 0, icon: '🎟️', color: 'bg-rose-100 text-rose-700' },
    { label: 'Promo Global', value: stats?.promos || 0, icon: '✨', color: 'bg-fuchsia-100 text-fuchsia-700' },
    { label: 'Delivery Jobs', value: stats?.jobs || 0, icon: '🚚', color: 'bg-sky-100 text-sky-700' },
  ]

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">📊 Platform Monitoring</h1>
        <p className="text-slate-500 mb-8">Pantau statistik keseluruhan dari SEAPEDIA</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${m.color}`}>
                {m.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{m.label}</p>
                <p className="text-2xl font-black text-slate-800">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
