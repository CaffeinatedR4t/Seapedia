import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Truck, Store as StoreIcon, Navigation, CheckCircle2, Search, History, DollarSign, ChevronRight, PackageCheck, AlertCircle } from 'lucide-react'
import client from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export default function DriverDashboard() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  
  const [activeOrders, setActiveOrders] = useState([])
  const [history, setHistory] = useState([])
  const [earnings, setEarnings] = useState({ completed_jobs: 0, total_earnings: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [activeRes, historyRes, earningsRes] = await Promise.all([
        client.get('/driver/orders/active'),
        client.get('/driver/orders/history'),
        client.get('/driver/earnings')
      ])
      setActiveOrders(activeRes.data)
      setHistory(historyRes.data)
      setEarnings(earningsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFinish = async (id) => {
    try {
      await client.put(`/driver/orders/${id}/finish`)
      fetchData()
    } catch (err) {
      alert('Gagal menyelesaikan pesanan')
    }
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-paper-50 pb-20 font-body">
      {/* Top Navbar */}
      <nav className="bg-white sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b border-paper-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-white shadow-md">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="font-display font-bold text-ink-900 text-lg leading-tight">Halo, {user?.username}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Status: Aktif</span>
            </div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/') }} className="text-sm font-semibold text-coral-600 hover:text-coral-700 transition-colors bg-coral-100 px-4 py-2 rounded-full">
          Keluar
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Top Earnings & Find Job */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="col-span-2 bg-ink-900 rounded-2xl p-6 text-paper-50 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign size={80} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-500 mb-1 flex items-center gap-1.5">
                <DollarSign size={16} className="text-gold-500" /> Pendapatan Hari Ini
              </p>
              <p className="font-display font-bold text-3xl tracking-tight text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                Rp {earnings.total_earnings.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-6">
              <div>
                <p className="text-xs text-ink-500 font-medium">Order Selesai</p>
                <p className="font-bold text-lg text-white">{earnings.completed_jobs}</p>
              </div>
              <div className="h-8 w-px bg-ink-700"></div>
              <div>
                <p className="text-xs text-ink-500 font-medium">Performa</p>
                <p className="font-bold text-lg text-success flex items-center gap-1">Sangat Baik</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/driver/available')}
            className="col-span-1 bg-gold-500 hover:bg-gold-500/90 text-white rounded-2xl p-4 flex flex-col items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95 group"
          >
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search size={28} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-wide">Cari Order</span>
          </button>
        </div>

        {/* Active Deliveries */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-display font-bold text-ink-900 flex items-center gap-2">
              <Navigation size={22} className="text-gold-500" /> Sedang Diantar
            </h2>
            <span className="bg-paper-200 text-ink-700 text-xs font-bold px-3 py-1 rounded-full">{activeOrders.length} Order</span>
          </div>

          <div className="space-y-5">
            {activeOrders.map(o => (
              <div key={o.id} className="card p-6 bg-white border border-paper-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gold-500"></div>
                
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <span className="text-[10px] font-bold bg-gold-500/10 text-gold-500 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">ID: #{o.id}</span>
                    <h3 className="font-display font-bold text-ink-900 text-lg flex items-center gap-2">
                      <StoreIcon size={18} className="text-ink-500" /> {o.store_name}
                    </h3>
                  </div>
                  <div className="text-right bg-paper-50 px-3 py-1.5 rounded-lg border border-paper-200">
                    <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-wide">Metode</p>
                    <p className="font-bold text-ink-900 text-sm">{o.delivery_method}</p>
                  </div>
                </div>
                
                <div className="bg-coral-50 border border-coral-100 p-4 rounded-xl mb-6 flex items-start gap-3">
                  <AlertCircle size={18} className="text-coral-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-coral-700 mb-1">Panduan Pengiriman</p>
                    <p className="text-xs text-coral-600/80 leading-relaxed">Pastikan barang dalam kondisi baik saat serah terima. Hubungi pembeli jika sudah mendekati lokasi.</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleFinish(o.id)}
                  className="w-full bg-gold-500 hover:bg-gold-500/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] group"
                >
                  <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                  Selesaikan Pengiriman
                </button>
              </div>
            ))}
            
            {activeOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-paper-200 shadow-sm">
                <div className="w-16 h-16 bg-paper-50 rounded-full flex items-center justify-center mb-4">
                  <PackageCheck size={32} className="text-ink-500/50" />
                </div>
                <p className="font-display font-semibold text-ink-900 text-lg mb-1">Semua Selesai!</p>
                <p className="text-sm text-ink-500 text-center max-w-[250px]">Tidak ada order yang sedang diantar saat ini. Kamu bisa mencari order baru.</p>
              </div>
            )}
          </div>
        </section>

        {/* Job History */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-display font-bold text-ink-900 flex items-center gap-2">
              <History size={22} className="text-ink-500" /> Riwayat Pekerjaan
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-paper-200 shadow-sm overflow-hidden">
            {history.map((o, idx) => (
              <div key={o.id} className={`p-5 flex items-center justify-between gap-4 transition-colors hover:bg-paper-50 cursor-default ${idx !== history.length - 1 ? 'border-b border-paper-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="text-success" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-ink-900 text-sm">Order #{o.id}</span>
                      <span className="text-[9px] font-bold bg-paper-200 text-ink-500 px-2 py-0.5 rounded uppercase tracking-wider">{o.store_name}</span>
                    </div>
                    <p className="text-xs text-ink-500 font-medium">{formatDate(o.completed_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-0.5">Pendapatan</p>
                  <p className="font-bold text-success text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    +Rp {o.delivery_fee.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
            
            {history.length === 0 && (
              <div className="p-8 text-center text-ink-500 font-medium text-sm">
                Belum ada riwayat pekerjaan yang diselesaikan.
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
