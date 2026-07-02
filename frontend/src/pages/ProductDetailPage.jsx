import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const DELIVERY = [
  { id: 'Instant',  label: 'Instant',  desc: 'Pengiriman hari ini', fee: 15000,  icon: '⚡' },
  { id: 'Next Day', label: 'Next Day', desc: 'Tiba besok',          fee: 10000,  icon: '📦' },
  { id: 'Regular',  label: 'Regular',  desc: 'Tiba 3-5 hari',       fee: 5000,   icon: '🚚' },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, activeRole } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDelivery, setSelectedDelivery] = useState('Regular')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    client.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => setError('Produk tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">{error || 'Produk tidak ditemukan'}</h2>
        <Link to="/products" className="btn-md btn-primary mt-4 inline-flex">Kembali ke Produk</Link>
      </div>
    </div>
  )

  const delivery = DELIVERY.find(d => d.id === selectedDelivery)
  const subtotal = product.price * qty
  const tax = Math.round((subtotal + delivery.fee) * 0.12)
  const total = subtotal + delivery.fee + tax

  const gradients = ['from-sky-400 to-cyan-400', 'from-blue-400 to-sky-500', 'from-teal-400 to-emerald-400']
  const gradient = gradients[product.id % gradients.length]

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-sky-100 px-4 py-3">
        <div className="max-w-7xl mx-auto text-sm text-slate-500 flex items-center gap-2">
          <Link to="/" className="hover:text-sky-600">Beranda</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-sky-600">Produk</Link>
          <span>›</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Image */}
          <div>
            <div className="card overflow-hidden aspect-square">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <span className="text-8xl">🐠</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Store */}
            <div className="flex items-center gap-2">
              <span className="badge bg-sky-100 text-sky-700">🏪 {product.store?.name || 'SEAPEDIA Store'}</span>
            </div>

            {/* Name + Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>
              <p className="text-3xl font-extrabold text-sky-700">{formatRupiah(product.price)}</p>
            </div>

            {/* Stock */}
            <div>
              {product.stock === 0 ? (
                <span className="badge bg-red-100 text-red-700 text-sm py-1">Stok Habis</span>
              ) : product.stock <= 5 ? (
                <span className="badge bg-amber-100 text-amber-700 text-sm py-1">⚠ Stok terbatas: {product.stock}</span>
              ) : (
                <span className="badge bg-emerald-100 text-emerald-700 text-sm py-1">✓ Stok: {product.stock}</span>
              )}
            </div>

            {/* Description */}
            <div className="card p-4">
              <h3 className="font-semibold text-slate-700 mb-2">Deskripsi Produk</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Delivery Method */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Metode Pengiriman</h3>
              <div className="grid grid-cols-3 gap-2">
                {DELIVERY.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDelivery(d.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedDelivery === d.id
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-sky-100 bg-white text-slate-600 hover:border-sky-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{d.icon}</div>
                    <div className="font-semibold text-xs">{d.label}</div>
                    <div className="text-xs text-slate-500">{formatRupiah(d.fee)}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">📍 {delivery?.desc}</p>
            </div>

            {/* Price Summary */}
            <div className="card p-4 space-y-2 bg-sky-50">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({qty} item)</span><span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Biaya kirim ({delivery?.label})</span><span>{formatRupiah(delivery?.fee || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>PPN 12%</span><span>{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-sky-200 pt-2">
                <span>Total</span><span className="text-sky-700 text-lg">{formatRupiah(total)}</span>
              </div>
            </div>

            {/* CTA */}
            {isAuthenticated && activeRole === 'buyer' ? (
              <button className="btn-lg btn-primary w-full" disabled={product.stock === 0}>
                {product.stock === 0 ? 'Stok Habis' : '🛒 Tambah ke Keranjang'} 
              </button>
            ) : (
              <div className="space-y-2">
                <button disabled className="btn-lg btn-primary w-full opacity-60 cursor-not-allowed">
                  🛒 Tambah ke Keranjang
                </button>
                <p className="text-xs text-slate-500 text-center">
                  {isAuthenticated
                    ? '💡 Aktifkan peran Pembeli untuk berbelanja'
                    : <><Link to="/login" className="text-sky-600 hover:underline">Masuk</Link> atau <Link to="/register" className="text-sky-600 hover:underline">Daftar</Link> sebagai Pembeli untuk checkout</>
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
