import { useState, useEffect } from 'react'
import AdminSidebar from '../../../components/AdminSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Ticket, Plus, Sparkles, Tag, AlertCircle, Percent } from 'lucide-react'

const formatDate = (dateString) => {
  if (!dateString) return '-'
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
    <div className="flex min-h-screen bg-paper-50 font-body">
      <AdminSidebar />
      <main className="flex-1 p-8 lg:p-12 w-full max-w-7xl mx-auto">
        
        <div className="mb-10 border-b border-paper-200 pb-6">
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-coral-100 rounded-xl flex items-center justify-center text-coral-700 shadow-sm">
              <Ticket size={22} />
            </div>
            Voucher & Promo
          </h1>
          <p className="text-ink-500 text-sm font-medium">Buat dan kelola kode promo serta voucher untuk meningkatkan transaksi.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-paper-200 px-2">
          <button
            onClick={() => setActiveTab('promo')}
            className={`pb-3 px-2 font-semibold text-sm transition-colors flex items-center gap-2 relative ${activeTab === 'promo' ? 'text-ink-900' : 'text-ink-500 hover:text-ink-700'}`}
          >
            <Sparkles size={18} className={activeTab === 'promo' ? 'text-gold-500' : ''} /> Promo Global
            {activeTab === 'promo' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ink-900 rounded-t-full"></div>}
          </button>
          <button
            onClick={() => setActiveTab('voucher')}
            className={`pb-3 px-2 font-semibold text-sm transition-colors flex items-center gap-2 relative ${activeTab === 'voucher' ? 'text-ink-900' : 'text-ink-500 hover:text-ink-700'}`}
          >
            <Tag size={18} className={activeTab === 'voucher' ? 'text-coral-600' : ''} /> Voucher Toko
            {activeTab === 'voucher' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ink-900 rounded-t-full"></div>}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Create Form Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-paper-200 shadow-sm sticky top-8">
              <h3 className="font-display font-bold text-ink-900 mb-5 flex items-center gap-2">
                <Plus size={20} className="text-ink-500" /> Buat {activeTab === 'promo' ? 'Promo' : 'Voucher'} Baru
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase tracking-wide mb-1.5">Kode {activeTab === 'promo' ? 'Promo' : 'Voucher'}</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-paper-200 bg-paper-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all uppercase font-semibold tracking-widest"
                    placeholder="E.g. MERDEKA24"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Percent size={12} /> Aturan Diskon
                  </label>
                  <input
                    type="text"
                    required
                    value={discountRule}
                    onChange={e => setDiscountRule(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-paper-200 bg-paper-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all"
                    placeholder="flat:50000 atau percent:10"
                  />
                  <div className="mt-2 bg-info/10 border border-info/20 p-2.5 rounded-lg flex items-start gap-2">
                    <AlertCircle size={14} className="text-info shrink-0 mt-0.5" />
                    <p className="text-[11px] text-info font-medium leading-relaxed">
                      Ketik <span className="font-bold">flat:NOMINAL</span> (potongan Rp) atau <span className="font-bold">percent:ANGKA</span> (diskon %).
                    </p>
                  </div>
                </div>

                {activeTab === 'voucher' && (
                  <div>
                    <label className="block text-xs font-bold text-ink-700 uppercase tracking-wide mb-1.5">Batas Penggunaan</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={usageLimit}
                      onChange={e => setUsageLimit(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-paper-200 bg-paper-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all"
                      placeholder="Misal: 100 kali pakai"
                    />
                  </div>
                )}
                
                <button type="submit" className="w-full bg-ink-900 hover:bg-ink-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm mt-2">
                  <Plus size={18} /> Buat {activeTab === 'promo' ? 'Promo' : 'Voucher'}
                </button>
              </form>
            </div>
          </div>

          {/* List Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-paper-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-paper-200 bg-paper-50 flex items-center justify-between">
                <h3 className="font-display font-bold text-ink-900">Daftar {activeTab === 'promo' ? 'Promo' : 'Voucher'} Aktif</h3>
                <span className="text-xs font-bold bg-ink-200 text-ink-700 px-3 py-1 rounded-full">{items.length} Data</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-ink-700 whitespace-nowrap">
                  <thead className="bg-white text-ink-500 font-semibold border-b border-paper-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Kode {activeTab === 'promo' ? 'Promo' : 'Voucher'}</th>
                      <th className="px-6 py-4">Aturan Diskon</th>
                      {activeTab === 'voucher' && <th className="px-6 py-4 text-center">Batas Pakai</th>}
                      <th className="px-6 py-4">Kedaluwarsa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-100">
                    {loading && items.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'voucher' ? "4" : "3"} className="px-6 py-12 text-center"><LoadingSpinner /></td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'voucher' ? "4" : "3"} className="px-6 py-12 text-center">
                          <Ticket size={32} className="mx-auto text-ink-300 mb-3" />
                          <p className="text-ink-500 font-medium">Belum ada {activeTab === 'promo' ? 'promo' : 'voucher'} yang dibuat.</p>
                        </td>
                      </tr>
                    ) : (
                      items.map(p => (
                        <tr key={p.ID} className="hover:bg-paper-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-ink-900 tracking-wider">
                            <span className="bg-paper-200 px-2 py-1 rounded-md">{p.code}</span>
                          </td>
                          <td className="px-6 py-4 font-medium">{p.discount_rule}</td>
                          {activeTab === 'voucher' && <td className="px-6 py-4 text-center font-bold text-ink-900">{p.usage_limit}</td>}
                          <td className="px-6 py-4 text-ink-500 text-xs">{formatDate(p.expiry_date)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
