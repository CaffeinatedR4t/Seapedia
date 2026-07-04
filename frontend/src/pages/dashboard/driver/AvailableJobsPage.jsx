import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, Navigation, Clock, SearchX, CheckCircle2 } from 'lucide-react'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export default function AvailableJobsPage() {
  const navigate = useNavigate()
  const [availableOrders, setAvailableOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAvailable = async () => {
    try {
      setLoading(true)
      const res = await client.get('/driver/orders/available')
      setAvailableOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailable()
  }, [])

  const handlePickup = async (id) => {
    try {
      await client.put(`/driver/orders/${id}/pickup`)
      navigate('/driver/dashboard')
    } catch (err) {
      alert('Gagal mengambil pesanan')
    }
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-paper-50 pb-24 font-body">
      <nav className="bg-white sticky top-0 z-20 px-4 py-4 flex items-center border-b border-paper-200 shadow-sm">
        <button 
          onClick={() => navigate('/driver/dashboard')} 
          className="w-10 h-10 flex items-center justify-center text-ink-700 hover:bg-paper-100 rounded-full transition-colors mr-3 active:scale-95"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="font-display font-bold text-ink-900 text-lg leading-tight">Order Tersedia</h1>
          <p className="text-ink-500 text-xs font-medium mt-0.5 tracking-wide">Pilih order yang siap diantar</p>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider flex items-center gap-2">
            <Package size={16} /> Daftar Antrean
          </h2>
          <span className="bg-gold-500/10 text-gold-500 text-xs font-bold px-3 py-1 rounded-full">{availableOrders.length} Ditemukan</span>
        </div>

        <div className="space-y-4">
          {availableOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-paper-200 shadow-sm mt-8">
              <div className="w-20 h-20 bg-paper-50 rounded-full flex items-center justify-center mb-5">
                <SearchX size={36} className="text-ink-300" />
              </div>
              <p className="font-display font-semibold text-ink-900 text-xl mb-2">Area Sedang Kosong</p>
              <p className="text-sm text-ink-500 text-center max-w-[280px]">Belum ada pesanan yang siap dikirim di areamu. Coba muat ulang halaman ini nanti.</p>
              <button 
                onClick={fetchAvailable}
                className="mt-6 font-semibold text-gold-500 bg-gold-500/10 hover:bg-gold-500/20 px-6 py-2.5 rounded-full transition-colors active:scale-95"
              >
                Muat Ulang
              </button>
            </div>
          ) : (
            availableOrders.map(o => (
              <div key={o.id} className="bg-white p-5 rounded-2xl border border-paper-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-ink-200 group-hover:bg-gold-500 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold bg-paper-100 text-ink-500 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2.5 inline-block">Order #{o.id}</span>
                    <h3 className="font-display font-bold text-ink-900 text-lg flex items-center gap-2 leading-tight">
                      <MapPin size={18} className="text-gold-500 shrink-0" />
                      {o.store_name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-ink-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-sm">
                      {o.delivery_method}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-ink-500 mb-6 bg-paper-50 w-fit px-3 py-1.5 rounded-lg border border-paper-100">
                  <Clock size={14} className="text-ink-400" />
                  <span>Dipesan: {formatDate(o.created_at)}</span>
                </div>
                
                <button 
                  onClick={() => handlePickup(o.id)}
                  className="w-full bg-gold-500 hover:bg-gold-500/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                >
                  <CheckCircle2 size={18} />
                  Ambil Order Ini
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
