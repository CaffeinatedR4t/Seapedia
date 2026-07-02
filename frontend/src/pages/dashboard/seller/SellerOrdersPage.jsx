import { useState, useEffect } from 'react'
import SellerSidebar from '../../../components/SellerSidebar'
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

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/seller/orders')
      .then(res => setOrders(res.data))
      .catch(err => {
        if (err.response?.status === 403 && err.response?.data?.error?.includes('profil toko')) {
          setError('Toko belum dibuat.')
        } else {
          setError('Gagal memuat pesanan.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleProcessOrder = async (id) => {
    try {
      await client.put(`/seller/orders/${id}/status`, { status: 'Menunggu Pengirim' })
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'Menunggu Pengirim' } : o))
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal memproses pesanan')
    }
  }

  if (loading) return <div className="flex bg-sky-50 min-h-screen"><SellerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <SellerSidebar />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">🧾 Pesanan Masuk</h1>
        <p className="text-slate-500 mb-8">Pantau dan kelola pesanan dari pembeli</p>

        {error ? (
          <div className="card p-12 text-center text-slate-500 max-w-lg mx-auto border-dashed">
            <span className="text-4xl block mb-4">🏪</span>
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-800">Order #{o.id}</span>
                      <span className={`text-xs px-2 py-1 rounded-md font-semibold ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Tanggal: {formatDate(o.created_at)} • Metode: {o.delivery_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Pendapatan (Total)</p>
                    <p className="font-bold text-emerald-600 text-lg">{formatRupiah(o.total)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-slate-500">
                    {o.status === 'Sedang Dikemas' ? 'Pesanan perlu diproses.' : 'Pesanan sudah diproses.'}
                  </span>
                  {o.status === 'Sedang Dikemas' && (
                    <button 
                      onClick={() => handleProcessOrder(o.id)} 
                      className="btn-sm btn-primary bg-sky-600 hover:bg-sky-700"
                    >
                      Proses Pesanan
                    </button>
                  )}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="card p-12 text-center text-slate-500 border-dashed">
                <span className="text-5xl block mb-4">🏝️</span>
                Belum ada pesanan masuk.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
