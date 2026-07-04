import { useState, useEffect } from 'react'
import client from '../api/client'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Fish, Search, X, AlertTriangle } from 'lucide-react'

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
    <div className="min-h-screen bg-paper-50">
      {/* Header */}
      <div className="bg-ink-900 text-paper-50 py-12 px-4 border-b border-ink-700">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-paper-200 mb-3 font-medium">
            <a href="/" className="hover:text-white transition-colors duration-200">Beranda</a> <span className="mx-2">&rsaquo;</span> <span className="text-white">Produk</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 flex items-center gap-3 text-white">
            Semua Produk <Fish className="text-coral-600" size={36} />
          </h1>
          <p className="text-paper-200 text-lg">Temukan ribuan produk laut pilihan dari penjual terpercaya</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative max-w-xl mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"><Search size={18} /></span>
          <input
            id="product-search"
            className="input-field pl-10"
            placeholder="Cari produk atau nama toko..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-900"><X size={18} /></button>
          )}
        </div>

        {error && (
          <div className="card p-6 text-center text-red-600 mb-6 flex items-center justify-center gap-2"><AlertTriangle size={20} /> {error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={64} className="mx-auto mb-4 text-ink-500 opacity-50" />
            <h3 className="text-xl font-display font-semibold text-ink-900 mb-2">Produk tidak ditemukan</h3>
            <p className="text-ink-700">Coba kata kunci lain atau hapus filter pencarian</p>
            {search && <button onClick={() => setSearch('')} className="mt-4 btn-md btn-primary">Hapus Pencarian</button>}
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-500 mb-4">
              Menampilkan <span className="font-semibold text-ink-900">{filtered.length}</span> produk
              {search && <> untuk "<span className="text-coral-600">{search}</span>"</>}
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
