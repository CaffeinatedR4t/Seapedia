import { useState, useEffect } from 'react'
import client from '../api/client'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'

function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-5 w-32 mt-2" />
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/products')
      .then(r => setProducts(r.data))
      .catch(() => setError('Gagal memuat produk. Coba refresh halaman.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.store?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-800 to-cyan-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-sky-300 mb-3">
            <a href="/" className="hover:text-white">Beranda</a> &rsaquo; <span className="text-white">Produk</span>
          </nav>
          <h1 className="text-3xl font-extrabold mb-2">Semua Produk 🐠</h1>
          <p className="text-sky-200">Temukan ribuan produk laut pilihan dari penjual terpercaya</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative max-w-xl mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            id="product-search"
            className="input-field pl-10"
            placeholder="Cari produk atau nama toko..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
          )}
        </div>

        {error && (
          <div className="card p-6 text-center text-red-600 mb-6">⚠ {error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Produk tidak ditemukan</h3>
            <p className="text-slate-500">Coba kata kunci lain atau hapus filter pencarian</p>
            {search && <button onClick={() => setSearch('')} className="mt-4 btn-md btn-primary">Hapus Pencarian</button>}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">
              Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> produk
              {search && <> untuk "<span className="text-sky-600">{search}</span>"</>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
