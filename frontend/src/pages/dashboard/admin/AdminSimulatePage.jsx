import { useState } from 'react'
import AdminSidebar from '../../../components/AdminSidebar'
import client from '../../../api/client'

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
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">⏳ Simulasi SLA (Overdue)</h1>
        <p className="text-slate-500 mb-8">Uji coba mekanisme pengembalian otomatis untuk pesanan yang melewati batas waktu pengiriman.</p>

        <div className="card p-6 border-l-4 border-l-rose-500">
          <h3 className="font-bold text-slate-800 mb-2 text-lg">Mekanisme Pembatalan Otomatis</h3>
          <p className="text-slate-600 mb-6 text-sm">
            Sistem secara berkala mengecek pesanan dengan status <span className="font-semibold text-amber-600">Menunggu Pengirim</span>. 
            Jika pesanan melewati batas waktu (SLA) metode pengiriman, pesanan otomatis dibatalkan, status menjadi <span className="font-semibold text-rose-600">Dikembalikan</span>, dan dana dikembalikan ke dompet pembeli.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-2 text-sm text-slate-700">
            <p>⏱️ <strong>SLA Pengiriman:</strong></p>
            <ul className="list-disc pl-5">
              <li>Instant: 1 hari</li>
              <li>Next Day: 2 hari</li>
              <li>Regular: 3 hari</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleSimulate(false)}
              disabled={loading}
              className="btn-primary bg-slate-900 hover:bg-slate-800"
            >
              {loading ? 'Memproses...' : '▶️ Jalankan Pengecekan Normal'}
            </button>
            <button 
              onClick={() => handleSimulate(true)}
              disabled={loading}
              className="btn-primary bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
            >
              ⚠️ Paksa Batal Semua (Demo)
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-bold">{result.message}</p>
                <p className="text-sm">Jumlah pesanan dibatalkan otomatis: {result.processed}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
