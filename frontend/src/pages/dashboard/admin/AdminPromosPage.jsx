import { useState, useEffect } from 'react'
import AdminSidebar from '../../../components/AdminSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Ticket, PlusCircle, Sparkles } from 'lucide-react'

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export default function AdminPromosPage() {
  const [activeTab, setActiveTab] = useState('promo') // 'promo' | 'voucher'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [code, setCode] = useState('')
  const [discountRule, setDiscountRule] = useState('')
  const [usageLimit, setUsageLimit] = useState('')

  const fetchData = () => {
    setLoading(true)
    const endpoint = activeTab === 'promo' ? '/admin/promos' : '/admin/vouchers'
    client.get(endpoint)
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { code, discount_rule: discountRule }
      if (activeTab === 'voucher') {
        payload.usage_limit = parseInt(usageLimit, 10)
      }
      const endpoint = activeTab === 'promo' ? '/admin/promos' : '/admin/vouchers'
      await client.post(endpoint, payload)
      setCode('')
      setDiscountRule('')
      setUsageLimit('')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal membuat data')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-ink-900 mb-2 flex items-center gap-2">
          <Ticket className="text-ink-700" size={28} /> Vouchers & Promos
        </h1>
        <p className="text-ink-500 mb-6">Kelola kode promo dan voucher untuk semua transaksi</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-paper-200">
          <button
            onClick={() => setActiveTab('promo')}
            className={`pb-2 px-4 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === 'promo' ? 'border-b-2 border-ink-900 text-ink-900' : 'text-ink-500 hover:text-ink-700'}`}
          >
            <Sparkles size={16} /> Promo Global
          </button>
          <button
            onClick={() => setActiveTab('voucher')}
            className={`pb-2 px-4 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === 'voucher' ? 'border-b-2 border-ink-900 text-ink-900' : 'text-ink-500 hover:text-ink-700'}`}
          >
            <Ticket size={16} /> Voucher Pengguna
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="card p-6 bg-paper-100 border border-paper-200 rounded-lg shadow-sm">
              <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
                <PlusCircle size={20} className="text-ink-700" /> Buat {activeTab === 'promo' ? 'Promo' : 'Voucher'} Baru
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1">Kode {activeTab === 'promo' ? 'Promo' : 'Voucher'}</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="input-field uppercase w-full bg-paper-50 border border-paper-200 rounded-md p-2 focus:border-ink-700 focus:ring-1 focus:ring-ink-700"
                    placeholder="Contoh: MERDEKA24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1">Aturan Diskon</label>
                  <input
                    type="text"
                    required
                    value={discountRule}
                    onChange={e => setDiscountRule(e.target.value)}
                    className="input-field w-full bg-paper-50 border border-paper-200 rounded-md p-2 focus:border-ink-700 focus:ring-1 focus:ring-ink-700"
                    placeholder="Contoh: flat:50000 atau percent:10"
                  />
                  <p className="text-xs text-ink-500 mt-1">Format: flat:NOMINAL atau percent:PERSENTASE</p>
                </div>
                {activeTab === 'voucher' && (
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-1">Batas Penggunaan (Usage Limit)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={usageLimit}
                      onChange={e => setUsageLimit(e.target.value)}
                      className="input-field w-full bg-paper-50 border border-paper-200 rounded-md p-2 focus:border-ink-700 focus:ring-1 focus:ring-ink-700"
                      placeholder="Contoh: 100"
                    />
                  </div>
                )}
                <button type="submit" className="btn-primary w-full bg-ink-900 text-paper-50 py-2 rounded-md hover:bg-ink-700 font-semibold transition-colors flex items-center justify-center gap-2">
                  <PlusCircle size={18} /> Buat {activeTab === 'promo' ? 'Promo' : 'Voucher'}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card p-0 overflow-hidden bg-paper-100 border border-paper-200 rounded-lg shadow-sm">
              <table className="w-full text-left text-sm text-ink-700">
                <thead className="bg-paper-200 text-ink-900 font-semibold border-b border-paper-200">
                  <tr>
                    <th className="px-6 py-4">Kode {activeTab === 'promo' ? 'Promo' : 'Voucher'}</th>
                    <th className="px-6 py-4">Aturan</th>
                    {activeTab === 'voucher' && <th className="px-6 py-4">Limit</th>}
                    <th className="px-6 py-4">Kedaluwarsa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200">
                  {loading && items.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'voucher' ? "4" : "3"} className="px-6 py-8 text-center"><LoadingSpinner /></td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'voucher' ? "4" : "3"} className="px-6 py-8 text-center text-ink-500">
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    items.map(p => (
                      <tr key={p.ID} className="hover:bg-paper-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-ink-900">{p.code}</td>
                        <td className="px-6 py-4">{p.discount_rule}</td>
                        {activeTab === 'voucher' && <td className="px-6 py-4">{p.usage_limit}</td>}
                        <td className="px-6 py-4">{formatDate(p.expiry_date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
