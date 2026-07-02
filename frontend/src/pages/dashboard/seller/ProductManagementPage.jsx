import { useState, useEffect } from 'react'
import SellerSidebar from '../../../components/SellerSidebar'
import client from '../../../api/client'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function ProductManagementPage() {
  const [products, setProducts] = useState([])
  const [storeExists, setStoreExists] = useState(true)
  const [loading, setLoading] = useState(true)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', image_url: '' })
  
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    try {
      const res = await client.get('/seller/products')
      setProducts(res.data)
      setStoreExists(true)
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error?.includes('profil toko')) {
        setStoreExists(false)
      } else {
        setError('Gagal memuat produk')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleOpenForm = (product = null) => {
    if (product) {
      setEditingId(product.id)
      setFormData({ 
        name: product.name, 
        description: product.description, 
        price: product.price, 
        stock: product.stock, 
        image_url: product.image_url || '' 
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', description: '', price: '', stock: '', image_url: '' })
    }
    setError('')
    setIsFormOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return
    try {
      await client.delete(`/seller/products/${id}`)
      fetchProducts()
    } catch (err) {
      alert('Gagal menghapus produk')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock)
    }

    try {
      if (editingId) {
        await client.put(`/seller/products/${editingId}`, payload)
      } else {
        await client.post('/seller/products', payload)
      }
      setIsFormOpen(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex bg-sky-50 min-h-screen"><SellerSidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div>

  if (!storeExists) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
        <SellerSidebar />
        <main className="flex-1 p-8">
          <div className="card p-8 text-center max-w-lg mx-auto mt-12">
            <span className="text-4xl mb-4 block">🏪</span>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Toko Belum Dibuat</h2>
            <p className="text-slate-500 mb-6">Kamu harus membuat profil toko terlebih dahulu sebelum bisa menambahkan produk.</p>
            <a href="/seller/store" className="btn-md btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">Buat Profil Toko</a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sky-50">
      <SellerSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">📦 Manajemen Produk</h1>
            <p className="text-slate-500">Kelola katalog produk untuk tokomu</p>
          </div>
          <button onClick={() => handleOpenForm()} className="btn-md btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
            + Tambah Produk
          </button>
        </div>

        {error && !isFormOpen && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="card overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-100 relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-4xl">🛍️</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 line-clamp-1" title={p.name}>{p.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mt-1 flex-1">{p.description || 'Tidak ada deskripsi'}</p>
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Harga & Stok</p>
                    <p className="font-bold text-emerald-600">Rp {p.price.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-slate-500 mt-1">Stok: {p.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenForm(p)} className="p-2 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors">✏️</button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              Belum ada produk. Tambahkan produk pertamamu!
            </div>
          )}
        </div>

        {/* Modal Form */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
              </div>
              
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk *</label>
                  <input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required minLength={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                  <textarea name="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field min-h-[80px] py-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp) *</label>
                    <input type="number" name="price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-field" required min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stok *</label>
                    <input type="number" name="stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="input-field" required min="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar</label>
                  <input name="image_url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="input-field" placeholder="https://..." />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="btn-md btn-ghost text-slate-600">Batal</button>
                  <button type="submit" disabled={saving} className="btn-md btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
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
