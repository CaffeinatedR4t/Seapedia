import { useState } from 'react'
import AdminSidebar from '../../../components/AdminSidebar'
import client from '../../../api/client'
import { Clock, PlayCircle, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react'

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
    <div className="flex min-h-screen bg-paper-50 font-body">
      <AdminSidebar />
      <main className="flex-1 p-8 lg:p-12 w-full max-w-7xl mx-auto">
        <div className="mb-10 border-b border-paper-200 pb-6">
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center text-error shadow-sm">
              <ShieldAlert size={22} />
            </div>
            Simulasi SLA (Overdue)
          </h1>
          <p className="text-ink-500 text-sm font-medium">Uji coba mekanisme pembatalan otomatis untuk pesanan yang melewati batas waktu Service Level Agreement.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-10 border border-paper-200 shadow-sm relative overflow-hidden max-w-4xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-full -z-10" />
          
          <div className="flex items-center gap-3 mb-5">
            <Info className="text-info" size={24} />
            <h3 className="font-display font-bold text-ink-900 text-xl">Mekanisme Pembatalan Otomatis</h3>
          </div>
          
          <p className="text-ink-600 mb-8 text-sm leading-relaxed max-w-3xl">
            Sistem secara berkala mengecek pesanan dengan status <span className="font-bold text-warning uppercase tracking-wide text-[11px] bg-warning/10 px-2 py-0.5 rounded">Menunggu Pengirim</span>. 
            Jika pesanan melewati batas waktu pengiriman, sistem akan secara otomatis membatalkan pesanan, merubah status menjadi <span className="font-bold text-error uppercase tracking-wide text-[11px] bg-error/10 px-2 py-0.5 rounded">Dikembalikan</span>, dan mengembalikan dana penuh ke dompet pembeli.
          </p>

          <div className="bg-paper-50 p-6 rounded-xl border border-paper-200 mb-10">
            <h4 className="flex items-center gap-2 font-bold text-ink-900 mb-4 text-sm uppercase tracking-wider">
              <Clock size={18} className="text-ink-500" /> Waktu SLA Pengiriman Berdasarkan Metode
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-paper-200 shadow-sm">
                <p className="font-display font-bold text-ink-900 mb-1">Instant</p>
                <p className="text-ink-500 text-xs font-semibold uppercase tracking-wider">Batas Waktu: 1 Hari</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-paper-200 shadow-sm">
                <p className="font-display font-bold text-ink-900 mb-1">Next Day</p>
                <p className="text-ink-500 text-xs font-semibold uppercase tracking-wider">Batas Waktu: 2 Hari</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-paper-200 shadow-sm">
                <p className="font-display font-bold text-ink-900 mb-1">Regular</p>
                <p className="text-ink-500 text-xs font-semibold uppercase tracking-wider">Batas Waktu: 3 Hari</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <button 
              onClick={() => handleSimulate(false)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-ink-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-ink-800 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <PlayCircle size={20} />
              {loading ? 'Memproses...' : 'Simulasi Normal'}
            </button>
            <button 
              onClick={() => handleSimulate(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-error text-white font-bold py-4 px-6 rounded-xl hover:bg-error/90 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <AlertTriangle size={20} />
              Paksa Refund (Bypass Waktu)
            </button>
          </div>

          {result && (
            <div className="mt-8 p-6 bg-success/10 text-success rounded-xl border border-success/20 flex items-start gap-4">
              <div className="p-2 bg-success/20 rounded-full shrink-0">
                <CheckCircle className="text-success" size={24} />
              </div>
              <div>
                <p className="font-display font-bold text-lg mb-1">{result.message}</p>
                <p className="text-success text-sm font-medium">Jumlah pesanan yang otomatis dibatalkan: <span className="font-bold text-lg bg-success/20 px-2 py-0.5 rounded ml-1">{result.processed}</span></p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
