import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Frown, Store, Image as ImageIcon, Trash2, Minus, Plus } from 'lucide-react'
import BuyerSidebar from '../../../components/BuyerSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCart = async () => {
    try {
      const res = await client.get('/buyer/cart')
      setCart(res.data)
    } catch (err) {
      setError('Gagal memuat keranjang.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return
    try {
      const res = await client.put(`/buyer/cart/${itemId}`, { quantity: newQty })
      setCart(res.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengubah kuantitas')
    }
  }

  const removeItem = async (itemId) => {
    try {
      const res = await client.delete(`/buyer/cart/${itemId}`)
      setCart(res.data)
    } catch (err) {
      alert('Gagal menghapus item')
    }
  }

  if (loading) return <div className="flex bg-paper-50 min-h-screen"><BuyerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  const hasItems = cart?.items?.length > 0
  const subtotal = cart?.subtotal || 0

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <BuyerSidebar />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-2"><ShoppingCart className="text-coral-600" /> Keranjang Belanja</h1>

        {error && <div className="mb-6 p-4 bg-error/10 text-error rounded-xl">{error}</div>}

        {!hasItems ? (
          <div className="card p-16 text-center flex flex-col items-center">
            <Frown size={64} className="text-ink-400 mb-4" />
            <h2 className="text-xl font-bold text-ink-900 mb-2">Keranjang Kosong</h2>
            <p className="text-ink-500 mb-6">Belum ada barang di keranjangmu.</p>
            <Link to="/products" className="btn-md btn-primary">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-4 flex items-center gap-2 text-ink-900 bg-paper-100 border-paper-200">
                <Store size={18} className="text-coral-600" /> <span className="font-bold">{cart.store?.name}</span>
              </div>
              
              <div className="card divide-y divide-paper-200">
                {cart.items.map(item => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-paper-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={32} className="text-ink-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-ink-900 line-clamp-1">{item.product.name}</h3>
                      <p className="text-coral-600 font-bold mt-1">{formatRupiah(item.product.price)}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-paper-50 rounded-lg p-1 border border-paper-200 w-fit">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded bg-paper-100 shadow-sm text-ink-700 hover:text-coral-600"><Minus size={14} /></button>
                          <span className="w-4 text-center font-medium text-sm text-ink-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded bg-paper-100 shadow-sm text-ink-700 hover:text-coral-600"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-sm text-error hover:text-error/80 font-medium flex items-center gap-1"><Trash2 size={16} /> Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Summary */}
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-ink-900 mb-4">Ringkasan Belanja</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-ink-700">
                  <span>Subtotal produk</span><span>{formatRupiah(subtotal)}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/buyer/checkout')}
                className="btn-lg btn-primary w-full"
              >
                Lanjut ke Checkout
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
