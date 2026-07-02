import { useState, useEffect } from 'react'
import AdminSidebar from '../../../components/AdminSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [code, setCode] = useState('')
  const [discountRule, setDiscountRule] = useState('')

  const fetchPromos = () => {
    setLoading(true)
    client.get('/admin/promos')
      .then(res => setPromos(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPromos()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await client.post('/admin/promos', { code, discount_rule: discountRule })
      setCode('')
      setDiscountRule('')
      fetchPromos()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal membuat promo')
    }
  }

  if (loading && promos.length === 0) return <div className="flex bg-slate-50 min-h-screen"><AdminSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">🎟️ Promo Global</h1>
        <p className="text-slate-500 mb-8">Kelola kode promo untuk semua transaksi</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="card p-6">
              <h3 className="font-bold text-slate-800 mb-4">Buat Promo Baru</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Promo</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="input-field uppercase"
                    placeholder="Contoh: MERDEKA24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Aturan Diskon</label>
                  <input
                    type="text"
                    required
                    value={discountRule}
                    onChange={e => setDiscountRule(e.target.value)}
                    className="input-field"
                    placeholder="Contoh: flat:50000 atau percent:10"
                  />
                  <p className="text-xs text-slate-500 mt-1">Format: flat:NOMINAL atau percent:PERSENTASE</p>
                </div>
                <button type="submit" className="btn-primary w-full">Buat Promo</button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Kode Promo</th>
                    <th className="px-6 py-4">Aturan</th>
                    <th className="px-6 py-4">Kedaluwarsa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {promos.map(p => (
                    <tr key={p.ID} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{p.code}</td>
                      <td className="px-6 py-4">{p.discount_rule}</td>
                      <td className="px-6 py-4">{formatDate(p.expiry_date)}</td>
                    </tr>
                  ))}
                  {promos.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                        Belum ada promo global.
                      </td>
                    </tr>
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
