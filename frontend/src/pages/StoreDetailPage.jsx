import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductCard from '../components/ProductCard'

export default function StoreDetailPage() {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get(`/stores/${id}`)
      .then(res => setStore(res.data))
      .catch(err => {
        if (err.response?.status === 404) setError('Toko tidak ditemukan')
        else setError('Gagal memuat data toko')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner fullScreen />
  
  if (error) {
    return (
      <div className="container-custom py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">🏪 {error}</h2>
        <Link to="/products" className="btn-md btn-primary">Kembali ke Belanja</Link>
      </div>
    )
  }

  if (!store) return null

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Store Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white pt-24 pb-12">
        <div className="container-custom flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-white">
            🏪
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold mb-2">{store.name}</h1>
            <p className="text-emerald-50 max-w-2xl">{store.description || 'Tidak ada deskripsi toko.'}</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Semua Produk di Toko Ini</h2>
          <span className="text-slate-500">{store.products?.length || 0} Produk</span>
        </div>

        {store.products?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {store.products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-5xl mb-4 block">🏝️</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Produk</h3>
            <p className="text-slate-500">Toko ini belum menambahkan produk apa pun.</p>
          </div>
        )}
      </div>
    </div>
  )
}
