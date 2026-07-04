import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import { Users, Store as StoreIcon, Package, Receipt, Ticket, Sparkles, Truck, BarChart2, AlertCircle, RefreshCw } from 'lucide-react'
import client from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = () => {
    setLoading(true)
    client.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading && !stats) return <div className="flex bg-paper-50 min-h-screen"><AdminSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  const metrics = [
    { label: 'Pengguna', value: stats?.users || 0, icon: <Users size={24} />, bg: 'bg-ink-100', color: 'text-ink-700' },
    { label: 'Toko', value: stats?.stores || 0, icon: <StoreIcon size={24} />, bg: 'bg-success/10', color: 'text-success' },
    { label: 'Produk', value: stats?.products || 0, icon: <Package size={24} />, bg: 'bg-warning/10', color: 'text-warning' },
    { label: 'Pesanan', value: stats?.orders || 0, icon: <Receipt size={24} />, bg: 'bg-info/10', color: 'text-info' },
    { label: 'Pesanan Telat', value: stats?.overdue_orders || 0, icon: <AlertCircle size={24} />, bg: 'bg-error/10', color: 'text-error' },
    { label: 'Voucher', value: stats?.vouchers || 0, icon: <Ticket size={24} />, bg: 'bg-coral-100', color: 'text-coral-700' },
    { label: 'Promo Global', value: stats?.promos || 0, icon: <Sparkles size={24} />, bg: 'bg-gold-500/10', color: 'text-gold-500' },
    { label: 'Delivery Jobs', value: stats?.jobs || 0, icon: <Truck size={24} />, bg: 'bg-ink-900/10', color: 'text-ink-900' },
  ]

  return (
    <div className="flex min-h-screen bg-paper-50 font-body">
      <AdminSidebar />
      <main className="flex-1 p-8 lg:p-12 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-paper-200 pb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-ink-900 mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-ink-900 rounded-xl flex items-center justify-center text-white shadow-sm">
                <BarChart2 size={22} />
              </div>
              Platform Monitoring
            </h1>
            <p className="text-ink-500 text-sm font-medium">Pantau statistik operasional dan kesehatan ekosistem SEAPEDIA secara real-time</p>
          </div>
          <button 
            onClick={fetchStats}
            className="flex items-center gap-2 bg-white border border-paper-200 hover:bg-paper-100 text-ink-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors active:scale-95 shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Segarkan Data
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map(m => (
            <div key={m.label} className="bg-white p-6 rounded-2xl shadow-sm border border-paper-200 flex flex-col hover:shadow-md transition-shadow group relative overflow-hidden">
              {/* Subtle accent line on top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-10"></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.bg} ${m.color} group-hover:scale-110 transition-transform`}>
                  {m.icon}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-ink-500 mb-1 uppercase tracking-wider">{m.label}</p>
                <p className="text-4xl font-display font-bold text-ink-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {m.value.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
