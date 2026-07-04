import { useState, useEffect } from 'react'
import SellerSidebar from '../../../components/SellerSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Store as StoreIcon } from 'lucide-react'

export default function StoreManagementPage() {
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    client.get('/seller/store')
      .then(res => {
        setStore(res.data)
        setFormData({ name: res.data.name, description: res.data.description })
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          setError('Gagal memuat profil toko.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      if (store) {
        const res = await client.put('/seller/store', formData)
        setStore(res.data)
        setSuccess('Profil toko berhasil diperbarui.')
      } else {
        const res = await client.post('/seller/store', formData)
        setStore(res.data)
        setSuccess('Toko berhasil dibuat!')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan profil toko.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex bg-paper-50 min-h-screen"><SellerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper-50">
      <SellerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-ink-900 mb-2 flex items-center gap-2">
          <StoreIcon className="text-coral-600" /> {store ? 'Kelola Toko' : 'Buat Toko'}
        </h1>
        <p className="text-ink-500 mb-8">{store ? 'Perbarui informasi tokomu agar menarik pembeli' : 'Daftarkan tokomu untuk mulai berjualan di SEAPEDIA'}</p>

        <div className="card p-6 max-w-2xl">
          {error && <div className="mb-4 p-3 bg-error/10 border border-error/20 text-error rounded-lg text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-success/10 border border-success/20 text-success rounded-lg text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nama Toko</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama tokomu..."
                className="input-field"
                required
                minLength={3}
                maxLength={100}
              />
              <p className="text-xs text-ink-500 mt-1">Nama toko harus unik dan belum digunakan seller lain.</p>
            </div>
            
            <div>
              <label className="label">Deskripsi</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ceritakan tentang tokomu dan produk yang kamu jual..."
                className="input-field min-h-[100px] py-2"
                maxLength={500}
              />
            </div>

            <button type="submit" disabled={saving} className="btn-lg btn-primary w-full mt-4">
              {saving ? <LoadingSpinner size="sm" /> : (store ? 'Simpan Perubahan' : 'Buat Toko Sekarang')}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
