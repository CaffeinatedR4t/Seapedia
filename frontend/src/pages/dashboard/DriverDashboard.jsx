import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export default function DriverDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  
  const [activeOrders, setActiveOrders] = useState([])
  const [availableOrders, setAvailableOrders] = useState([])
  const [earnings, setEarnings] = useState({ completed_jobs: 0, total_earnings: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [activeRes, availableRes, earningsRes] = await Promise.all([
        client.get('/driver/orders/active'),
        client.get('/driver/orders/available'),
        client.get('/driver/earnings')
      ])
      setActiveOrders(activeRes.data)
      setAvailableOrders(availableRes.data)
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

  const handlePickup = async (id) => {
    try {
      await client.put(`/driver/orders/${id}/pickup`)
      fetchData()
    } catch (err) {
      alert('Gagal mengambil pesanan')
    }
  }

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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
            🚚
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none mb-1">Portal Driver</h1>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Aktif</span>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/') }} className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
          Keluar
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-6">
        
        {/* Active Deliveries */}
        <section className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">Sedang Diantar</h2>
              <span className="bg-amber-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {activeOrders.length}
              </span>
            </div>
            <div className="text-right bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 mb-0.5">Pendapatan Hari Ini</p>
              <p className="font-bold text-emerald-700 text-sm">
                Rp {earnings.total_earnings.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {activeOrders.map(o => (
              <div key={o.id} className="card p-5 border-l-4 border-l-amber-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="badge bg-amber-100 text-amber-700 font-bold px-2 py-1">Order #{o.id}</span>
                    <h3 className="font-bold text-slate-800 mt-2 text-lg">🏪 {o.store_name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Metode</p>
                    <p className="font-semibold text-slate-700">{o.delivery_method}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm text-slate-600">
                  <p>Pastikan barang sampai dengan aman ke tujuan.</p>
                </div>
                
                <button 
                  onClick={() => handleFinish(o.id)}
                  className="btn-md bg-amber-500 hover:bg-amber-600 text-white w-full font-bold shadow-amber-500/20"
                >
                  ✓ Selesaikan Pengiriman
                </button>
              </div>
            ))}
            {activeOrders.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium">
                Tidak ada pesanan yang sedang diantar
              </div>
            )}
          </div>
        </section>

        {/* Available Deliveries */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-slate-800">Tersedia untuk Diambil</h2>
            <span className="bg-sky-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {availableOrders.length}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {availableOrders.map(o => (
              <div key={o.id} className="card p-4 hover:border-sky-300 transition-colors flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-700">#{o.id}</span>
                  <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-medium">{o.delivery_method}</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">🏪 {o.store_name}</h3>
                <p className="text-xs text-slate-500 mb-4">{formatDate(o.created_at)}</p>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => handlePickup(o.id)}
                    className="btn-md w-full bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Ambil Pesanan
                  </button>
                </div>
              </div>
            ))}
            {availableOrders.length === 0 && (
              <div className="sm:col-span-2 text-center p-8 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
                <span className="text-4xl block mb-2">☕</span>
                Belum ada pesanan baru untuk saat ini.
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
