import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import { Users, Store as StoreIcon, Package, Receipt, Ticket, Sparkles, Truck, BarChart2, AlertCircle } from 'lucide-react'
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

  if (loading) return <div className="flex bg-paper-50 min-h-screen"><AdminSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  const metrics = [
    { label: 'Pengguna', value: stats?.users || 0, icon: <Users size={24} />, color: 'bg-paper-200 text-ink-900' },
    { label: 'Toko', value: stats?.stores || 0, icon: <StoreIcon size={24} />, color: 'bg-success/20 text-success' },
    { label: 'Produk', value: stats?.products || 0, icon: <Package size={24} />, color: 'bg-warning/20 text-warning' },
    { label: 'Pesanan', value: stats?.orders || 0, icon: <Receipt size={24} />, color: 'bg-info/20 text-info' },
    { label: 'Pesanan Telat', value: stats?.overdue_orders || 0, icon: <AlertCircle size={24} />, color: 'bg-error/20 text-error' },
    { label: 'Voucher', value: stats?.vouchers || 0, icon: <Ticket size={24} />, color: 'bg-coral-100 text-coral-700' },
    { label: 'Promo Global', value: stats?.promos || 0, icon: <Sparkles size={24} />, color: 'bg-gold-500/20 text-gold-500' },
    { label: 'Delivery Jobs', value: stats?.jobs || 0, icon: <Truck size={24} />, color: 'bg-ink-200 text-ink-700' },
  ]

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-ink-900 mb-2 flex items-center gap-2"><BarChart2 className="text-ink-700" /> Platform Monitoring</h1>
        <p className="text-ink-500 mb-8">Pantau statistik keseluruhan dari SEAPEDIA</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="bg-paper-100 p-6 rounded-2xl shadow-sm border border-paper-200 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${m.color}`}>
                {m.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">{m.label}</p>
                <p className="text-2xl font-black text-ink-900">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
