import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Store as StoreIcon } from 'lucide-react'
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

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get(`/buyer/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => setError('Pesanan tidak ditemukan'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex bg-sky-50 min-h-screen"><BuyerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>
  if (error || !order) return (
    <div className="flex bg-sky-50 min-h-screen">
      <BuyerSidebar />
      <main className="flex-1 p-8 text-center pt-24">
        <h2 className="text-xl font-bold text-slate-700 mb-4">{error}</h2>
        <Link to="/buyer/orders" className="btn-md btn-primary">Kembali ke Daftar Pesanan</Link>
      </main>
    </div>
  )

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <BuyerSidebar />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/buyer/orders" className="text-slate-500 hover:text-sky-600 font-bold text-xl">←</Link>
          <h1 className="text-2xl font-bold text-slate-900">Detail Pesanan #{order.id}</h1>
          <span className={`text-xs px-2 py-1 rounded-md font-semibold ml-auto ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Store & Items */}
            <div className="card p-0 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center gap-2">
                <StoreIcon size={18} className="text-coral-600" /> {order.store_name}
              </div>
              <div className="divide-y divide-slate-100">
                {order.items?.map(item => (
                  <div key={item.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800">{item.product_name}</p>
                      <p className="text-sm text-slate-500">{item.quantity} x {formatRupiah(item.price_at_purchase)}</p>
                    </div>
                    <div className="font-bold text-sky-700">
                      {formatRupiah(item.quantity * item.price_at_purchase)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-800 mb-4">Lacak Pesanan</h3>
              <div className="space-y-4">
                {order.history?.map((h, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                      {i !== order.history.length - 1 && <div className="w-0.5 h-full bg-sky-200 my-1"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-slate-800">{h.status}</p>
                      <p className="text-xs text-slate-500">{formatDate(h.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4">Rincian Pembayaran</h3>
              
              <div className="space-y-2 mb-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Metode Pengiriman</span><span className="font-medium text-slate-800">{order.delivery_method}</span>
                </div>
                <hr className="my-2 border-slate-100" />
                <div className="flex justify-between">
                  <span>Subtotal Produk</span><span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Pengiriman</span><span>{formatRupiah(order.delivery_fee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon</span><span>-{formatRupiah(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PPN 12%</span><span>{formatRupiah(order.ppn)}</span>
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-800">Total Belanja</span>
                <span className="text-xl font-extrabold text-sky-700">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
