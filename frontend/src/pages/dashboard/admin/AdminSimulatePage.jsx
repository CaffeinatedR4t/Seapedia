import { useState } from 'react'
import AdminSidebar from '../../../components/AdminSidebar'
import client from '../../../api/client'
import { Clock, PlayCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export default function AdminSimulatePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSimulate = async (force) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await client.post(`/admin/simulate-overdue${force ? '?force=true' : ''}`)
      setResult(res.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Simulasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-ink-900 mb-2 flex items-center gap-2">
          <Clock className="text-ink-700" size={28} /> Simulasi SLA (Overdue)
        </h1>
        <p className="text-ink-500 mb-8">Uji coba mekanisme pengembalian otomatis untuk pesanan yang melewati batas waktu pengiriman.</p>

        <div className="bg-paper-100 rounded-2xl p-8 border border-paper-200 shadow-sm relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-full -z-10" />
          
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-info" size={24} />
            <h3 className="font-bold text-ink-900 text-lg">Mekanisme Pembatalan Otomatis</h3>
          </div>
          
          <p className="text-ink-600 mb-6 text-sm leading-relaxed">
            Sistem secara berkala mengecek pesanan dengan status <span className="font-semibold text-warning">Menunggu Pengirim</span>. 
            Jika pesanan melewati batas waktu (SLA) metode pengiriman, pesanan otomatis dibatalkan, status menjadi <span className="font-semibold text-error">Dikembalikan</span>, dan dana dikembalikan ke dompet pembeli.
          </p>

          <div className="bg-paper-50 p-5 rounded-xl border border-paper-200 mb-8 space-y-3 text-sm text-ink-700">
            <p className="flex items-center gap-2 font-bold text-ink-900">
              <Clock size={18} className="text-ink-500" /> SLA Pengiriman:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <li className="bg-paper-100 p-3 rounded-lg border border-paper-200 flex flex-col">
                <span className="font-bold text-ink-900">Instant</span>
                <span className="text-ink-500 text-xs">Batas waktu 1 hari</span>
              </li>
              <li className="bg-paper-100 p-3 rounded-lg border border-paper-200 flex flex-col">
                <span className="font-bold text-ink-900">Next Day</span>
                <span className="text-ink-500 text-xs">Batas waktu 2 hari</span>
              </li>
              <li className="bg-paper-100 p-3 rounded-lg border border-paper-200 flex flex-col">
                <span className="font-bold text-ink-900">Regular</span>
                <span className="text-ink-500 text-xs">Batas waktu 3 hari</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => handleSimulate(false)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-ink-900 text-paper-50 font-semibold py-4 px-6 rounded-xl hover:bg-ink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <PlayCircle size={20} />
              {loading ? 'Memproses...' : 'Jalankan Simulasi Normal'}
            </button>
            <button 
              onClick={() => handleSimulate(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-error text-paper-50 font-bold py-4 px-6 rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <AlertTriangle size={20} />
              Jalankan Simulasi Waktu (Refund Otomatis)
            </button>
          </div>

          {result && (
            <div className="mt-8 p-6 bg-success/10 text-success-800 rounded-xl border border-success/20 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-2 bg-success/20 rounded-full">
                <CheckCircle className="text-success" size={24} />
              </div>
              <div>
                <p className="font-bold text-lg text-success-900">{result.message}</p>
                <p className="text-success-700 mt-1">Jumlah pesanan dibatalkan otomatis: <span className="font-black text-xl">{result.processed}</span></p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
