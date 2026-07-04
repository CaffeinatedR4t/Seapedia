import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, MapPin, Zap, Package, Truck, Store, Image as ImageIcon } from 'lucide-react'
import BuyerSidebar from '../../../components/BuyerSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const DELIVERY = [
  { id: 'Instant',  label: 'Instant',  desc: 'Pengiriman hari ini', fee: 15000,  icon: <Zap className="text-gold-500" size={24} /> },
  { id: 'Next Day', label: 'Next Day', desc: 'Tiba besok',          fee: 10000,  icon: <Package className="text-ink-700" size={24} /> },
  { id: 'Regular',  label: 'Regular',  desc: 'Tiba 3-5 hari',       fee: 5000,   icon: <Truck className="text-coral-600" size={24} /> },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [selectedDelivery, setSelectedDelivery] = useState('Regular')
  const [checkingOut, setCheckingOut] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)

  const fetchData = async () => {
    try {
      const [cartRes, walletRes, addressRes] = await Promise.all([
        client.get('/buyer/cart'),
        client.get('/buyer/wallet'),
        client.get('/buyer/address')
      ])
      setCart(cartRes.data)
      setWallet(walletRes.data)
      setAddresses(addressRes.data)
      if (addressRes.data.length > 0) {
        setSelectedAddressId(addressRes.data[0].id)
      }
    } catch (err) {
      setError('Gagal memuat data checkout.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setError('Pilih alamat pengiriman terlebih dahulu.')
      return
    }
    setCheckingOut(true)
    setError('')
    try {
      await client.post('/buyer/checkout', { 
        address_id: selectedAddressId,
        delivery_method: selectedDelivery,
        voucher_code: appliedVoucher || ''
      })
      navigate('/buyer/orders', { state: { message: 'Checkout berhasil!' } })
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout gagal')
      setCheckingOut(false)
    }
  }

  if (loading) return <div className="flex bg-paper-50 min-h-screen"><BuyerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  const hasItems = cart?.items?.length > 0
  if (!hasItems) {
    navigate('/buyer/cart')
    return null
  }

  const delivery = DELIVERY.find(d => d.id === selectedDelivery)
  const subtotal = cart?.subtotal || 0
  
  const discountAmount = appliedVoucher ? Math.min(subtotal * 0.1, 50000) : 0;
  
  const tax = Math.round((subtotal + delivery.fee) * 0.12)
  const total = subtotal + delivery.fee - discountAmount + tax
  const canAfford = wallet?.balance >= total

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <BuyerSidebar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-2"><CheckCircle className="text-coral-600" /> Checkout Pesanan</h1>

        {error && <div className="mb-6 p-4 bg-error/10 text-error rounded-xl">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Selection */}
            <div className="card p-6">
              <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-coral-600" /> Alamat Pengiriman</h3>
              
              {addresses.length === 0 ? (
                <div className="p-4 bg-paper-100 border border-paper-200 rounded-lg text-ink-700 text-sm">
                  Belum ada alamat pengiriman. <Link to="/buyer/address" className="text-coral-600 font-bold hover:underline">Tambah Alamat Baru</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(a => (
                    <label key={a.id} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === a.id ? 'border-coral-600 bg-coral-600/5' : 'border-paper-200 bg-paper-50 hover:border-coral-300'}`}>
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          name="address" 
                          value={a.id} 
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="mt-1 shrink-0 text-coral-600 focus:ring-coral-600"
                        />
                        <div>
                          <p className="font-bold text-ink-900">{a.label}</p>
                          <p className="text-sm text-ink-700 mt-1 whitespace-pre-wrap">{a.full_address}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Methods */}
            <div className="card p-6">
              <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2"><Truck size={18} className="text-coral-600" /> Pilih Pengiriman</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {DELIVERY.map(d => (
                  <button key={d.id} onClick={() => setSelectedDelivery(d.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedDelivery === d.id ? 'border-coral-600 bg-coral-600/5' : 'border-paper-200 bg-paper-50 hover:border-coral-300'}`}
                  >
                    <div className="mb-2">{d.icon}</div>
                    <div className={`font-semibold ${selectedDelivery === d.id ? 'text-coral-600' : 'text-ink-700'}`}>{d.label}</div>
                    <div className="text-xs text-ink-500 mt-1">{d.desc}</div>
                    <div className="text-sm font-bold text-ink-900 mt-2">{formatRupiah(d.fee)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="card p-6">
              <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2"><Store size={18} className="text-coral-600" /> {cart.store?.name}</h3>
              <div className="divide-y divide-paper-200">
                {cart.items.map(item => (
                  <div key={item.id} className="py-3 flex gap-4">
                    <div className="w-16 h-16 bg-paper-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={24} className="text-ink-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-ink-900 line-clamp-1 text-sm">{item.product.name}</h4>
                      <p className="text-xs text-ink-500 mt-1">{item.quantity} barang x {formatRupiah(item.product.price)}</p>
                      <p className="text-coral-600 font-bold mt-1 text-sm">{formatRupiah(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Checkout Summary */}
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold text-ink-900 mb-4">Ringkasan Belanja</h3>

            <div className="mb-4 flex gap-2">
              <input 
                type="text" 
                placeholder="Kode Voucher" 
                value={voucherCode} 
                onChange={e => setVoucherCode(e.target.value)} 
                className="input-field text-sm"
                disabled={appliedVoucher !== null}
              />
              {!appliedVoucher ? (
                <button onClick={() => setAppliedVoucher(voucherCode)} className="btn-sm btn-primary shrink-0">Pakai</button>
              ) : (
                <button onClick={() => { setAppliedVoucher(null); setVoucherCode('') }} className="btn-sm btn-outline text-error shrink-0 border-error hover:bg-error hover:text-paper-50 focus:ring-error">Hapus</button>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-ink-700">
                <span>Subtotal produk</span><span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-700">
                <span>Biaya pengiriman</span><span>{formatRupiah(delivery.fee)}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-sm text-success font-medium">
                  <span>Voucher Diskon</span><span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-ink-700">
                <span>PPN 12%</span><span>{formatRupiah(tax)}</span>
              </div>
              <div className="border-t border-paper-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-ink-900">Total Tagihan</span>
                <span className="text-xl font-extrabold text-coral-600">{formatRupiah(total)}</span>
              </div>
            </div>

            <div className="bg-paper-100 p-4 rounded-xl border border-paper-200 mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-ink-500">Saldo SEAPEDIA Pay</span>
                <span className={`text-sm font-bold ${canAfford ? 'text-success' : 'text-error'}`}>
                  {formatRupiah(wallet?.balance || 0)}
                </span>
              </div>
              {!canAfford && (
                <p className="text-xs text-error mt-1">Saldo tidak mencukupi. <Link to="/buyer/wallet" className="underline font-medium">Top up sekarang</Link></p>
              )}
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={!canAfford || checkingOut || addresses.length === 0} 
              className="btn-lg btn-primary w-full"
            >
              {checkingOut ? <LoadingSpinner size="sm" /> : 'Bayar Sekarang'}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
