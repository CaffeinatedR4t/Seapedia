import { Link } from 'react-router-dom'
import { Waves, Home, ShoppingBag } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-800 to-cyan-700 flex items-center justify-center p-4">
      <div className="text-center text-white animate-fade-in flex flex-col items-center">
        <div className="mb-6 animate-float"><Waves size={80} className="text-white" /></div>
        <h1 className="text-6xl font-extrabold mb-3">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-sky-200">Halaman Tidak Ditemukan</h2>
        <p className="text-sky-300 mb-8 max-w-md mx-auto">
          Sepertinya kamu tersesat di lautan. Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/" className="btn-lg btn-white flex items-center gap-2"><Home size={20} /> Kembali ke Beranda</Link>
          <Link to="/products" className="btn-lg btn-outline-white flex items-center gap-2"><ShoppingBag size={20} /> Lihat Produk</Link>
        </div>
      </div>
    </div>
  )
}
