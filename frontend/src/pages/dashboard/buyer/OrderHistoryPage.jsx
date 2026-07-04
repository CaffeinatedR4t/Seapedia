import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Package, CheckCircle, Store, ShoppingCart } from 'lucide-react'
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
    case 'Sedang Dikemas': return 'bg-gold-500/10 text-gold-500'
    case 'Menunggu Pengirim': return 'bg-ink-700/10 text-ink-700'
    case 'Sedang Dikirim': return 'bg-coral-600/10 text-coral-600'
    case 'Pesanan Selesai': return 'bg-success/10 text-success'
    case 'Dikembalikan': return 'bg-error/10 text-error'
    default: return 'bg-paper-200 text-ink-500'
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

  if (loading) return <div className="flex bg-paper-50 min-h-screen"><BuyerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <BuyerSidebar />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-2"><Package className="text-coral-600" /> Riwayat Pesanan</h1>

        {location.state?.message && (
          <div className="mb-6 p-4 bg-success/10 text-success border border-success/30 rounded-xl font-medium flex items-center gap-2">
            <CheckCircle size={20} /> {location.state.message}
          </div>
        )}

        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card p-5 hover:border-coral-600 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 border-b border-paper-200 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-ink-900 flex items-center gap-1"><Store size={16} className="text-coral-600" /> {o.store_name}</span>
                    <span className={`text-xs px-2 py-1 rounded-md font-semibold ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500">{formatDate(o.created_at)} • {o.delivery_method}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-500 mb-1">Total Belanja</p>
                  <p className="font-bold text-ink-900 text-lg">{formatRupiah(o.total)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Link to={`/buyer/orders/${o.id}`} className="text-sm text-coral-600 hover:underline font-medium">
                  Lihat Detail Pesanan →
                </Link>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="card p-12 text-center flex flex-col items-center">
              <ShoppingCart size={48} className="text-ink-500 mb-4" />
              <h3 className="text-lg font-bold text-ink-900 mb-2">Belum Ada Pesanan</h3>
              <p className="text-ink-500 mb-6">Ayo mulai belanja dan temukan barang impianmu.</p>
              <Link to="/products" className="btn-md btn-primary">Mulai Belanja</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
