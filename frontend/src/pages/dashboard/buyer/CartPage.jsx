import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BuyerSidebar from '../../../components/BuyerSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const DELIVERY = [
  { id: 'Instant',  label: 'Instant',  desc: 'Pengiriman hari ini', fee: 15000,  icon: '⚡' },
  { id: 'Next Day', label: 'Next Day', desc: 'Tiba besok',          fee: 10000,  icon: '📦' },
  { id: 'Regular',  label: 'Regular',  desc: 'Tiba 3-5 hari',       fee: 5000,   icon: '🚚' },
]

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [selectedDelivery, setSelectedDelivery] = useState('Regular')
  const [checkingOut, setCheckingOut] = useState(false)

  const fetchCartAndWallet = async () => {
    try {
      const [cartRes, walletRes] = await Promise.all([
        client.get('/buyer/cart'),
        client.get('/buyer/wallet')
      ])
      setCart(cartRes.data)
      setWallet(walletRes.data)
    } catch (err) {
      setError('Gagal memuat keranjang atau dompet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartAndWallet()
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

  const handleCheckout = async () => {
    setCheckingOut(true)
    setError('')
    try {
      await client.post('/buyer/checkout', { delivery_method: selectedDelivery })
      navigate('/buyer/orders', { state: { message: 'Checkout berhasil!' } })
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout gagal')
      setCheckingOut(false)
    }
  }

  if (loading) return <div className="flex bg-sky-50 min-h-screen"><BuyerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  const delivery = DELIVERY.find(d => d.id === selectedDelivery)
  const subtotal = cart?.subtotal || 0
  const tax = Math.round((subtotal + delivery.fee) * 0.12)
  const total = subtotal + delivery.fee + tax
  const canAfford = wallet?.balance >= total
  const hasItems = cart?.items?.length > 0

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <BuyerSidebar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">🛒 Keranjang Belanja</h1>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>}

        {!hasItems ? (
          <div className="card p-16 text-center">
            <span className="text-6xl mb-4 block">🏝️</span>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Keranjang Kosong</h2>
            <p className="text-slate-500 mb-6">Belum ada barang di keranjangmu.</p>
            <Link to="/products" className="btn-md btn-primary">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-4 flex items-center gap-2 text-sky-700 bg-sky-50 border-sky-200">
                <span>🏪</span> <span className="font-bold">{cart.store?.name}</span>
              </div>
              
              <div className="card divide-y divide-slate-100">
                {cart.items.map(item => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-2xl">🐠</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</h3>
                      <p className="text-sky-600 font-bold mt-1">{formatRupiah(item.product.price)}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200 w-fit">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 hover:text-sky-600">-</button>
                          <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 hover:text-sky-600">+</button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:text-red-700 font-medium">Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Methods */}
              <div className="card p-6">
                <h3 className="font-bold text-slate-800 mb-4">Pilih Pengiriman</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {DELIVERY.map(d => (
                    <button key={d.id} onClick={() => setSelectedDelivery(d.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${selectedDelivery === d.id ? 'border-sky-500 bg-sky-50' : 'border-slate-100 bg-white hover:border-sky-300'}`}
                    >
                      <div className="text-2xl mb-2">{d.icon}</div>
                      <div className={`font-semibold ${selectedDelivery === d.id ? 'text-sky-700' : 'text-slate-700'}`}>{d.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{d.desc}</div>
                      <div className="text-sm font-medium mt-2">{formatRupiah(d.fee)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Checkout Summary */}
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4">Ringkasan Belanja</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal produk</span><span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Biaya pengiriman</span><span>{formatRupiah(delivery.fee)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>PPN 12%</span><span>{formatRupiah(tax)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Tagihan</span>
                  <span className="text-xl font-extrabold text-sky-700">{formatRupiah(total)}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-slate-500">Saldo SEAPEDIA Pay</span>
                  <span className={`text-sm font-bold ${canAfford ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatRupiah(wallet?.balance || 0)}
                  </span>
                </div>
                {!canAfford && (
                  <p className="text-xs text-red-500 mt-1">Saldo tidak mencukupi. <Link to="/buyer/wallet" className="underline">Top up sekarang</Link></p>
                )}
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={!canAfford || checkingOut} 
                className="btn-lg btn-primary w-full"
              >
                {checkingOut ? <LoadingSpinner size="sm" /> : 'Bayar Sekarang'}
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
