import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import SellerSidebar from '../../components/SellerSidebar'
import { Store as StoreIcon, Package, Receipt, TrendingUp, RefreshCw, LogOut, AlertCircle } from 'lucide-react'

export default function SellerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [report, setReport] = useState({})
  
  useEffect(() => {
    client.get('/seller/report/income')
      .then(res => setReport(res.data?.income_per_month || {}))
      .catch(console.error)
  }, [])
  
  const reportEntries = Object.entries(report).sort((a, b) => a[0].localeCompare(b[0]))
  const maxValue = Math.max(...reportEntries.map(e => e[1]), 1)

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <SellerSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-ink-900 mb-1 flex items-center gap-2">
          Selamat datang, {user?.username}! <StoreIcon className="text-coral-600" />
        </h1>
        <p className="text-ink-500 mb-8">Dashboard Penjual - kelola toko dan produkmu</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Produk', value: 'Lihat Produk', icon: <Package size={20} />, color: 'text-coral-600 bg-coral-600/10', link: '/seller/products' },
            { label: 'Pesanan Masuk', value: 'Lihat Pesanan', icon: <Receipt size={20} />, color: 'text-success bg-success/10', link: '/seller/orders' },
            { label: 'Pendapatan', value: 'Lihat Laporan', icon: <TrendingUp size={20} />, color: 'text-ink-900 bg-ink-900/10', link: '/seller/reports' },
          ].map(({ label, value, icon, color, link }) => (
            <Link to={link} key={label} className="card p-5 card-hover block">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>{icon}</div>
                <div>
                  <p className="text-xs text-ink-500">{label}</p>
                  <p className="font-bold text-ink-900">{value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: 'Buat Toko', desc: 'Buat dan kelola profil tokomu di SEAPEDIA', link: '/seller/store', icon: <StoreIcon size={18} className="inline mr-2 text-coral-600" /> },
            { title: 'Manajemen Produk', desc: 'Tambah, edit, dan hapus produk jualanmu', link: '/seller/products', icon: <Package size={18} className="inline mr-2 text-coral-600" /> },
            { title: 'Proses Pesanan', desc: 'Lihat dan proses pesanan dari pembeli', link: '/seller/orders', icon: <Receipt size={18} className="inline mr-2 text-coral-600" /> },
          ].map(({ title, desc, link, icon }) => (
            <Link to={link} key={title} className="card p-6 card-hover border-paper-200 block">
              <h3 className="font-semibold text-ink-900 mb-1 flex items-center">{icon}{title}</h3>
              <p className="text-sm text-ink-500 mb-3">{desc}</p>
              <span className="text-sm text-coral-600 font-medium flex items-center gap-1 w-fit">Lihat Detail &rarr;</span>
            </Link>
          ))}
        </div>

        {/* Seller Income Report */}
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-display font-bold text-ink-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-success" size={24} /> Laporan Pendapatan
          </h2>
          <div className="card p-6 border-paper-200 bg-paper-100 flex items-end gap-4 h-64 relative">
            {reportEntries.length === 0 ? (
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
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-ink-900 mb-2 bg-paper-50 px-2 py-1 rounded shadow-sm whitespace-nowrap">
                      Rp {value.toLocaleString('id-ID')}
                    </div>
                    <div 
                      className="w-full max-w-[60px] bg-success rounded-t-md group-hover:bg-emerald-700 transition-colors" 
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-xs font-medium text-ink-500 mt-3">{monthName} {yyyy}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          {user?.roles?.length > 1 && <Link to="/role-selection" className="btn-md btn-secondary flex items-center gap-2"><RefreshCw size={16} /> Ganti Peran</Link>}
          <button onClick={() => { logout(); navigate('/') }} className="btn-md btn-ghost text-error flex items-center gap-2 hover:bg-error/10"><LogOut size={16} /> Keluar</button>
        </div>
      </main>
    </div>
  )
}

