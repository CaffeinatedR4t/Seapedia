import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BuyerSidebar from '../../../components/BuyerSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Sedang Dikemas': return 'bg-amber-100 text-amber-700'
    case 'Menunggu Pengirim': return 'bg-sky-100 text-sky-700'
    case 'Sedang Dikirim': return 'bg-blue-100 text-blue-700'
    case 'Pesanan Selesai': return 'bg-emerald-100 text-emerald-700'
    case 'Dikembalikan': return 'bg-red-100 text-red-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    client.get('/buyer/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex bg-sky-50 min-h-screen"><BuyerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <BuyerSidebar />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">📦 Riwayat Pesanan</h1>

        {location.state?.message && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium">
            ✅ {location.state.message}
          </div>
        )}

        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card p-5 hover:border-sky-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-slate-800">🏪 {o.store_name}</span>
                    <span className={`text-xs px-2 py-1 rounded-md font-semibold ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(o.created_at)} • {o.delivery_method}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Total Belanja</p>
                  <p className="font-bold text-sky-700 text-lg">{formatRupiah(o.total)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Link to={`/buyer/orders/${o.id}`} className="text-sm text-sky-600 hover:underline font-medium">
                  Lihat Detail Pesanan →
                </Link>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="card p-12 text-center">
              <span className="text-5xl block mb-4">🛒</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Pesanan</h3>
              <p className="text-slate-500 mb-6">Ayo mulai belanja dan temukan barang impianmu.</p>
              <Link to="/products" className="btn-md btn-primary">Mulai Belanja</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
