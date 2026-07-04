import { useState, useEffect } from 'react'
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import BuyerSidebar from '../../../components/BuyerSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export default function WalletPage() {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topupAmount, setTopupAmount] = useState('')
  const [isToppingUp, setIsToppingUp] = useState(false)

  const fetchWallet = async () => {
    try {
      const res = await client.get('/buyer/wallet')
      setWallet(res.data)
    } catch (err) {
      setError('Gagal memuat data dompet.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  const handleTopup = async (e) => {
    e.preventDefault()
    setIsToppingUp(true)
    setError('')
    try {
      await client.post('/buyer/wallet/topup', { amount: Number(topupAmount) })
      setTopupAmount('')
      fetchWallet()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal melakukan top up.')
    } finally {
      setIsToppingUp(false)
    }
  }

  if (loading) return <div className="flex bg-paper-50 min-h-screen"><BuyerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <BuyerSidebar />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-ink-900 mb-2 flex items-center gap-2"><Wallet className="text-coral-600" /> SEAPEDIA Pay</h1>
        <p className="text-ink-500 mb-8">Kelola saldo dan riwayat transaksi dompet digitalmu</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <div className="card p-6 bg-ink-900 text-paper-50 shadow-lg border-0">
            <h3 className="text-paper-200 font-medium mb-2">Total Saldo</h3>
            <p className="text-4xl font-extrabold mb-4">{formatRupiah(wallet?.balance || 0)}</p>
            <p className="text-paper-200 text-sm">Gunakan saldo ini untuk checkout lebih cepat.</p>
          </div>

          {/* Topup Form */}
          <div className="card p-6">
            <h3 className="font-bold text-ink-900 mb-4">Top Up Saldo (Dummy)</h3>
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Nominal (Min Rp 10.000)</label>
                <input 
                  type="number" 
                  value={topupAmount} 
                  onChange={e => setTopupAmount(e.target.value)}
                  className="input-field" 
                  placeholder="Contoh: 50000"
                  min="10000"
                  required 
                />
              </div>
              <button type="submit" disabled={isToppingUp} className="btn-md btn-primary w-full">
                {isToppingUp ? <LoadingSpinner size="sm" /> : 'Top Up Sekarang'}
              </button>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card p-6">
          <h3 className="font-bold text-ink-900 mb-6">Riwayat Transaksi</h3>
          <div className="space-y-4">
            {wallet?.transactions?.length > 0 ? (
              wallet.transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-4 border border-paper-200 rounded-xl hover:bg-paper-100 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                      ${tx.type === 'topup' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}
                    `}>
                      {tx.type === 'topup' ? <ArrowDownToLine size={20} /> : <ArrowUpFromLine size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900 capitalize">
                        {tx.type === 'topup' ? 'Top Up Saldo' : `Pembayaran Pesanan #${tx.order_id}`}
                      </p>
                      <p className="text-xs text-ink-500">{formatDate(tx.created_at)}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'topup' ? 'text-success' : 'text-ink-900'}`}>
                    {tx.type === 'topup' ? '+' : ''}{formatRupiah(tx.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-ink-500">Belum ada transaksi.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
