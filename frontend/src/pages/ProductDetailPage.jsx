import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { Search, Fish, Store, AlertTriangle, Check, ShoppingCart, Lightbulb, Minus, Plus } from 'lucide-react'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

export default function ProductDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, activeRole } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    client.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => setError('Produk tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      await client.post('/buyer/cart', { product_id: product.id, quantity: qty })
      navigate('/buyer/cart')
    } catch (err) {
      if (err.response?.data?.error === 'single-store') {
        alert('Tidak bisa menambah produk dari toko berbeda. Selesaikan atau hapus keranjang Anda terlebih dahulu.')
      } else {
        alert(err.response?.data?.error || 'Gagal menambahkan ke keranjang')
      }
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-paper-50">
      <div className="text-center">
        <Search size={64} className="mx-auto mb-4 text-ink-300" />
        <h2 className="text-xl font-bold text-ink-700 mb-2">{error || 'Produk tidak ditemukan'}</h2>
        <Link to="/products" className="btn-md btn-primary mt-4 inline-flex">Kembali ke Produk</Link>
      </div>
    </div>
  )

  const subtotal = product.price * qty
  const gradient = 'bg-ink-100'

  return (
    <div className="min-h-screen bg-paper-50">
      {/* Breadcrumb */}
      <div className="bg-paper-50 border-b border-paper-200 px-4 py-3">
        <div className="max-w-7xl mx-auto text-sm text-ink-500 flex items-center gap-2">
          <Link to="/" className="hover:text-coral-600">Beranda</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-coral-600">Produk</Link>
          <span>›</span>
          <span className="text-ink-900 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Image */}
          <div>
            <div className="card overflow-hidden aspect-square border-paper-200">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${gradient} flex items-center justify-center`}>
                  <Fish size={96} className="text-ink-300" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Store */}
            <div className="flex items-center gap-2">
              <span className="badge bg-coral-600/10 text-coral-600 flex items-center gap-1"><Store size={14} /> {product.store?.name || 'SEAPEDIA Store'}</span>
            </div>

            {/* Name + Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 mb-3">{product.name}</h1>
              <p className="text-3xl font-extrabold text-coral-600">{formatRupiah(product.price)}</p>
            </div>

            {/* Stock */}
            <div>
              {product.stock === 0 ? (
                <span className="badge bg-error/10 text-error text-sm py-1">Stok Habis</span>
              ) : product.stock <= 5 ? (
                <span className="badge bg-gold-500/10 text-gold-500 text-sm py-1 flex items-center gap-1 w-fit"><AlertTriangle size={14} /> Stok terbatas: {product.stock}</span>
              ) : (
                <span className="badge bg-success/10 text-success text-sm py-1 flex items-center gap-1 w-fit"><Check size={14} /> Stok: {product.stock}</span>
              )}
            </div>

            {/* Description */}
            <div className="card p-4 border-paper-200">
              <h3 className="font-semibold text-ink-700 mb-2">Deskripsi Produk</h3>
              <p className="text-ink-600 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity & CTA */}
            <div className="card p-4 space-y-4 border-paper-200 bg-paper-100">
              {isAuthenticated && activeRole === 'buyer' && product.stock > 0 && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-700 text-sm">Atur Jumlah</span>
                  <div className="flex items-center gap-3 bg-paper-50 rounded-lg p-1 border border-paper-200 w-fit">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center rounded bg-paper-100 shadow-sm text-ink-700 hover:text-coral-600"><Minus size={14} /></button>
                    <span className="w-6 text-center font-bold text-sm text-ink-900">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-8 h-8 flex items-center justify-center rounded bg-paper-100 shadow-sm text-ink-700 hover:text-coral-600"><Plus size={14} /></button>
                  </div>
                </div>
              )}

              <div className="flex justify-between font-bold text-ink-900 border-t border-paper-200 pt-3">
                <span>Subtotal</span><span className="text-coral-600 text-lg">{formatRupiah(subtotal)}</span>
              </div>

              {isAuthenticated && activeRole === 'buyer' ? (
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart} 
                  className="btn-lg btn-primary w-full flex justify-center items-center gap-2"
                >
                  {addingToCart ? <LoadingSpinner size="sm" /> : product.stock === 0 ? 'Stok Habis' : <><ShoppingCart size={18} /> Tambah ke Keranjang</>} 
                </button>
              ) : (
                <div className="space-y-2">
                  <button disabled className="btn-lg btn-primary w-full opacity-60 cursor-not-allowed flex justify-center items-center gap-2">
                    <ShoppingCart size={18} /> Tambah ke Keranjang
                  </button>
                  <p className="text-xs text-ink-500 text-center flex items-center justify-center gap-1">
                    {isAuthenticated
                      ? <><Lightbulb size={14} /> Aktifkan peran Pembeli untuk berbelanja</>
                      : <>Masuk sebagai Pembeli untuk membeli</>
                    }
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
