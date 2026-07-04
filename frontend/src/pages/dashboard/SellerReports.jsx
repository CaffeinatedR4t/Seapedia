import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import SellerSidebar from '../../components/SellerSidebar'
import { TrendingUp, AlertCircle, BarChart3, Download } from 'lucide-react'

export default function SellerReports() {
  const { user } = useAuth()
  const [report, setReport] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/seller/report/income')
      .then(res => setReport(res.data?.income_per_month || {}))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const reportEntries = Object.entries(report).sort((a, b) => a[0].localeCompare(b[0]))
  const maxValue = Math.max(...reportEntries.map(e => e[1]), 1)
  const totalIncome = reportEntries.reduce((acc, curr) => acc + curr[1], 0)

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <SellerSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-ink-900 mb-1 flex items-center gap-2">
              Laporan Pendapatan <TrendingUp className="text-success" />
            </h1>
            <p className="text-ink-500">Ringkasan pendapatan toko kamu dari waktu ke waktu</p>
          </div>
          <button className="btn-md btn-outline flex items-center gap-2" onClick={() => alert('Fitur unduh CSV akan segera hadir!')}>
            <Download size={16} /> Unduh CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 border-paper-200">
            <p className="text-sm text-ink-500 mb-1">Total Pendapatan (Sepanjang Waktu)</p>
            <p className="text-3xl font-bold text-success">Rp {totalIncome.toLocaleString('id-ID')}</p>
          </div>
          <div className="card p-6 border-paper-200">
            <p className="text-sm text-ink-500 mb-1">Bulan Teraktif</p>
            <p className="text-3xl font-bold text-ink-900">
              {reportEntries.length > 0 ? (() => {
                const best = [...reportEntries].sort((a, b) => b[1] - a[1])[0]
                const [y, m] = best[0].split('-')
                return `${new Date(y, m-1).toLocaleString('id-ID', {month:'short'})} ${y}`
              })() : '-'}
            </p>
          </div>
          <div className="card p-6 border-paper-200">
            <p className="text-sm text-ink-500 mb-1">Total Bulan Aktif</p>
            <p className="text-3xl font-bold text-ink-900">{reportEntries.length} Bulan</p>
          </div>
        </div>

        <div className="card p-8 border-paper-200">
          <h2 className="font-bold text-ink-900 mb-6 flex items-center gap-2">
            <BarChart3 className="text-ink-500" /> Grafik Pendapatan per Bulan
          </h2>
          
          <div className="h-80 relative flex items-end gap-4 mt-8 bg-paper-100 rounded-xl p-6">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">Loading...</div>
            ) : reportEntries.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-500">
                <AlertCircle size={32} className="mb-2 opacity-50" />
                <p>Belum ada data pendapatan</p>
              </div>
            ) : (
              reportEntries.map(([month, value], idx) => {
                const heightPercent = Math.max((value / maxValue) * 100, 5)
                const [yyyy, mm] = month.split('-')
                const monthName = new Date(yyyy, mm - 1).toLocaleString('id-ID', { month: 'short' })
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 justify-end h-full group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-ink-900 mb-2 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
                      Rp {value.toLocaleString('id-ID')}
                    </div>
                    <div 
                      className="w-full max-w-[80px] bg-success rounded-t-md group-hover:bg-emerald-600 transition-colors" 
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-xs font-medium text-ink-500 mt-3">{monthName} {yyyy}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
