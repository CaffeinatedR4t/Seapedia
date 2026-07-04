import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import BuyerSidebar from '../../components/BuyerSidebar'
import { Smile, Wallet, Package, ShoppingCart, MapPin, RefreshCw, LogOut, TrendingUp, AlertCircle } from 'lucide-react'

export default function BuyerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [report, setReport] = useState({})
  
  useEffect(() => {
    client.get('/buyer/report/spending')
      .then(res => setReport(res.data?.spending_per_month || {}))
      .catch(console.error)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }
  
  const reportEntries = Object.entries(report).sort((a, b) => a[0].localeCompare(b[0]))
  const maxValue = Math.max(...reportEntries.map(e => e[1]), 1)

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <BuyerSidebar />

      <main className="flex-1 p-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink-900 flex items-center gap-2">Selamat datang, {user?.username}! <Smile className="text-coral-600" /></h1>
          <p className="text-ink-500 mt-1">Ini adalah dashboard Pembeli kamu</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Saldo Dompet', value: 'Lihat Wallet', icon: <Wallet size={20} />, bg: 'bg-coral-600', link: '/buyer/wallet' },
            { label: 'Total Pesanan', value: 'Lihat Pesanan', icon: <Package size={20} />, bg: 'bg-ink-700', link: '/buyer/orders' },
            { label: 'Keranjang', value: 'Lihat Keranjang', icon: <ShoppingCart size={20} />, bg: 'bg-success', link: '/buyer/cart' },
          ].map(({ label, value, icon, bg, link }) => (
            <Link to={link} key={label} className="card p-5 card-hover block">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} text-paper-50 flex items-center justify-center text-lg`}>{icon}</div>
                <div>
                  <p className="text-xs text-ink-500">{label}</p>
                  <p className="font-bold text-ink-900">{value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Level 3 Functional Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: 'Dompet & Top-Up', desc: 'Kelola saldo dan riwayat transaksi wallet-mu', link: '/buyer/wallet', icon: <Wallet size={18} className="inline mr-2 text-coral-600" /> },
            { title: 'Keranjang Belanja', desc: 'Lihat produk yang sudah ditambah ke keranjang', link: '/buyer/cart', icon: <ShoppingCart size={18} className="inline mr-2 text-coral-600" /> },
            { title: 'Riwayat Pesanan', desc: 'Pantau status pengiriman pesananmu', link: '/buyer/orders', icon: <Package size={18} className="inline mr-2 text-coral-600" /> },
            { title: 'Alamat Pengiriman', desc: 'Kelola alamat pengiriman favoritmu', link: '/buyer/address', icon: <MapPin size={18} className="inline mr-2 text-coral-600" /> },
          ].map(({ title, desc, link, icon }) => (
            <Link to={link} key={title} className="card p-6 card-hover border-paper-200 block">
              <h3 className="font-semibold text-ink-900 mb-1 flex items-center">{icon}{title}</h3>
              <p className="text-sm text-ink-500 mb-3">{desc}</p>
              <span className="text-sm text-coral-600 font-medium flex items-center gap-1 w-fit">Lihat Detail &rarr;</span>
            </Link>
          ))}
        </div>

        {/* Buyer Spending Report */}
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-display font-bold text-ink-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-coral-600" size={24} /> Laporan Pengeluaran
          </h2>
          <div className="card p-6 border-paper-200 bg-paper-100 flex items-end gap-4 h-64 relative">
            {reportEntries.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-500">
                <AlertCircle size={32} className="mb-2 opacity-50" />
                <p>Belum ada data pengeluaran</p>
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
                      className="w-full max-w-[60px] bg-coral-600 rounded-t-md group-hover:bg-coral-700 transition-colors" 
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-xs font-medium text-ink-500 mt-3">{monthName} {yyyy}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-3">
          {user?.roles?.length > 1 && (
            <Link to="/role-selection" className="btn-md btn-secondary flex items-center gap-2"><RefreshCw size={16} /> Ganti Peran</Link>
          )}
          <button onClick={handleLogout} className="btn-md btn-ghost text-red-500 flex items-center gap-2"><LogOut size={16} /> Keluar</button>
        </div>
      </main>
    </div>
  )
}
