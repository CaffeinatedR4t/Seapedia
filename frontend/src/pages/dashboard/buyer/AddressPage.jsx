import { useState, useEffect } from 'react'
import BuyerSidebar from '../../../components/BuyerSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function AddressPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ label: '', full_address: '' })

  const fetchAddresses = async () => {
    try {
      const res = await client.get('/buyer/address')
      setAddresses(res.data)
    } catch (err) {
      setError('Gagal memuat alamat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleOpenForm = (addr = null) => {
    if (addr) {
      setEditingId(addr.id)
      setFormData({ label: addr.label, full_address: addr.full_address })
    } else {
      setEditingId(null)
      setFormData({ label: '', full_address: '' })
    }
    setError('')
    setIsFormOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus alamat ini?')) return
    try {
      await client.delete(`/buyer/address/${id}`)
      fetchAddresses()
    } catch (err) {
      alert('Gagal menghapus alamat')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingId) {
        await client.put(`/buyer/address/${editingId}`, formData)
      } else {
        await client.post('/buyer/address', formData)
      }
      setIsFormOpen(false)
      fetchAddresses()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan alamat')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex bg-sky-50 min-h-screen"><BuyerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <BuyerSidebar />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">📍 Alamat Pengiriman</h1>
            <p className="text-slate-500">Kelola daftar alamat untuk pengiriman pesananmu</p>
          </div>
          <button onClick={() => handleOpenForm()} className="btn-md btn-primary">
            + Tambah Alamat
          </button>
        </div>

        {error && !isFormOpen && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(a => (
            <div key={a.id} className="card p-6 border-l-4 border-l-sky-500">
              <div className="flex justify-between items-start mb-2">
                <span className="badge bg-sky-100 text-sky-700 font-bold">{a.label}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenForm(a)} className="text-slate-400 hover:text-sky-600">✏️</button>
                  <button onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-600">🗑️</button>
                </div>
              </div>
              <p className="text-slate-700 mt-3 whitespace-pre-wrap text-sm leading-relaxed">{a.full_address}</p>
            </div>
          ))}
          {addresses.length === 0 && (
            <div className="col-span-full card p-12 text-center text-slate-500 border-dashed">
              Belum ada alamat tersimpan.
            </div>
          )}
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-6 animate-slide-up">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{editingId ? 'Edit Alamat' : 'Tambah Alamat'}</h2>
              
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Label (Contoh: Rumah, Kantor)</label>
                  <input name="label" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="input-field" required maxLength={50} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                  <textarea name="full_address" value={formData.full_address} onChange={e => setFormData({...formData, full_address: e.target.value})} className="input-field min-h-[100px] py-2" required minLength={10} maxLength={500} />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="btn-md btn-ghost">Batal</button>
                  <button type="submit" disabled={saving} className="btn-md btn-primary">
                    {saving ? <LoadingSpinner size="sm" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
