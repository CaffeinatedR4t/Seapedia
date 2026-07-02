import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import ProductCard from '../components/ProductCard'
import StarRating from '../components/StarRating'
import Button from '../components/Button'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

// Skeleton card while loading
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

// Seed reviews shown when DB is empty
const SEED_REVIEWS = [
  { id: 's1', reviewer_name: 'Budi Santoso', rating: 5, comment: 'Marketplace terbaik untuk produk laut! Pengiriman cepat dan produk original.', created_at: new Date().toISOString() },
  { id: 's2', reviewer_name: 'Siti Rahayu', rating: 4, comment: 'Pilihan produknya lengkap banget. Senang belanja di sini, harga juga kompetitif.', created_at: new Date().toISOString() },
  { id: 's3', reviewer_name: 'Ahmad Fauzi', rating: 5, comment: 'Sudah 3 kali order, selalu puas. Penjualnya responsif dan produk sesuai deskripsi.', created_at: new Date().toISOString() },
]

const STATS = [
  { value: '1.000+', label: 'Produk Laut', icon: '🐠' },
  { value: '500+',   label: 'Penjual Aktif', icon: '🏪' },
  { value: '10rb+',  label: 'Pembeli Puas', icon: '😊' },
  { value: '4.9★',   label: 'Rating Rata-rata', icon: '⭐' },
]

const ROLES = [
  { icon: '🛒', title: 'Pembeli', color: 'from-sky-500 to-cyan-500', desc: 'Temukan produk laut terbaik. Bayar pakai dompet digital, nikmati berbagai metode pengiriman.' },
  { icon: '🏪', title: 'Penjual', color: 'from-emerald-500 to-teal-500', desc: 'Buka toko online-mu, kelola produk, dan raih penghasilan dari ribuan pembeli.' },
  { icon: '🚚', title: 'Driver', color: 'from-amber-500 to-orange-500', desc: 'Ambil pekerjaan pengiriman, antar pesanan, dan kumpulkan penghasilan harianmu.' },
  { icon: '⚙️', title: 'Admin', color: 'from-purple-500 to-indigo-500', desc: 'Kelola seluruh ekosistem marketplace: produk, pengguna, voucher, dan operasional.' },
]

export default function LandingPage() {
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Review form state
  const [form, setForm] = useState({ reviewer_name: '', rating: 0, comment: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    client.get('/products').then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoadingProducts(false))
    client.get('/reviews').then(r => setReviews(r.data)).catch(() => setReviews(SEED_REVIEWS)).finally(() => setLoadingReviews(false))
  }, [])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.reviewer_name.trim()) { setFormError('Nama wajib diisi'); return }
    if (form.rating === 0) { setFormError('Pilih rating bintang terlebih dahulu'); return }
    if (!form.comment.trim() || form.comment.length < 5) { setFormError('Komentar minimal 5 karakter'); return }

    setSubmitting(true)
    try {
      const res = await client.post('/reviews', form)
      setReviews(prev => [res.data, ...prev])
      setForm({ reviewer_name: '', rating: 0, comment: '' })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Gagal mengirim ulasan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const displayedReviews = reviews.length > 0 ? reviews : SEED_REVIEWS

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-sky-900 via-sky-800 to-cyan-700 text-white overflow-hidden min-h-[92vh] flex items-center">
        {/* Decorative bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['top-20 left-10', 'top-40 right-20', 'bottom-32 left-1/4', 'top-1/3 right-10'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} opacity-10`}>
              <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse-slow" style={{ animationDelay: `${i * 0.7}s` }} />
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm text-sky-200 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Marketplace Laut #1 di Indonesia
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Temukan Produk<br />
                <span className="bg-gradient-to-r from-cyan-300 to-sky-200 bg-clip-text text-transparent">
                  Laut Terbaik
                </span><br />
                di SEAPEDIA
              </h1>

              <p className="text-sky-200 text-lg leading-relaxed mb-8 max-w-lg">
                Dari peralatan selam hingga fashion pantai, SEAPEDIA menghadirkan ekosistem
                marketplace yang menghubungkan pembeli, penjual, dan driver dalam satu platform.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-lg btn-white">
                  🛍️ Jelajahi Produk
                </Link>
                <Link to="/register" className="btn-lg btn-outline-white">
                  Daftar Gratis →
                </Link>
              </div>
            </div>

            {/* Floating product showcase */}
            <div className="hidden lg:flex flex-col gap-4 animate-float">
              <div className="card-glass p-4 max-w-xs ml-auto">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-2xl">🤿</div>
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">Snorkeling Set Premium</p>
                    <p className="text-sky-600 font-bold text-sm">{formatRupiah(350000)}</p>
                  </div>
                </div>
              </div>
              <div className="card-glass p-4 max-w-xs animate-float-delay">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center text-2xl">🏄</div>
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">Surfboard Shortboard</p>
                    <p className="text-sky-600 font-bold text-sm">{formatRupiah(2800000)}</p>
                  </div>
                </div>
              </div>
              <div className="card-glass p-4 max-w-xs animate-float">
                <div className="flex items-center gap-3 justify-between">
                  <span className="text-slate-700 text-sm font-medium">Pesanan Selesai ✅</span>
                  <span className="badge bg-emerald-100 text-emerald-700">+{formatRupiah(15000)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full fill-sky-50" preserveAspectRatio="none" style={{ height: '60px' }}>
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-sky-100 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="text-center">
              <div className="text-3xl mb-1">{icon}</div>
              <div className="text-2xl font-extrabold text-sky-700">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="section bg-sky-50">
        <div className="container-xl">
          <h2 className="section-title">Produk Unggulan 🐠</h2>
          <p className="section-subtitle">Temukan produk laut pilihan dari penjual terpercaya SEAPEDIA</p>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products" className="btn-lg btn-primary">
              Lihat Semua Produk →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features / Roles ─────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-xl">
          <h2 className="section-title">Kenapa SEAPEDIA? 🌊</h2>
          <p className="section-subtitle">Satu platform untuk semua peran di ekosistem marketplace laut Indonesia</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map(({ icon, title, color, desc }) => (
              <div key={title} className="card-hover p-6 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl mx-auto mb-4 shadow-ocean`}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────── */}
      <section id="reviews" className="section bg-sky-50">
        <div className="container-xl">
          <h2 className="section-title">Apa Kata Mereka? ⭐</h2>
          <p className="section-subtitle">Ulasan nyata dari pengguna SEAPEDIA di seluruh Indonesia</p>

          {loadingReviews ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 space-y-3">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-4/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedReviews.slice(0, 6).map((r) => (
                <div key={r.id} className="card-hover p-6">
                  <StarRating rating={r.rating} size="sm" />
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed line-clamp-4">
                    "{r.comment}"
                  </p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-sky-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                      {r.reviewer_name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{r.reviewer_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Review Form ──────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="max-w-2xl mx-auto">
            <h2 className="section-title">Bagikan Pengalamanmu 📝</h2>
            <p className="section-subtitle">Ceritakan pengalamanmu menggunakan SEAPEDIA</p>

            <div className="card p-8">
              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                  ✅ Ulasan berhasil dikirim! Terima kasih.
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <label className="label">Nama Kamu *</label>
                  <input
                    className="input-field"
                    placeholder="Masukkan namamu"
                    value={form.reviewer_name}
                    onChange={e => setForm(prev => ({ ...prev, reviewer_name: e.target.value }))}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="label">Rating *</label>
                  <div className="flex items-center gap-3">
                    <StarRating rating={form.rating} interactive onChange={r => setForm(prev => ({ ...prev, rating: r }))} size="lg" />
                    <span className="text-sm text-slate-500">{form.rating > 0 ? `${form.rating}/5 bintang` : 'Klik bintang untuk memberi rating'}</span>
                  </div>
                </div>

                <div>
                  <label className="label">Ulasan *</label>
                  <textarea
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Ceritakan pengalamanmu menggunakan SEAPEDIA..."
                    value={form.comment}
                    onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
                    maxLength={1000}
                    rows={4}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{form.comment.length}/1000</p>
                </div>

                {formError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">⚠ {formError}</p>
                )}

                <Button type="submit" loading={submitting} size="lg" className="w-full">
                  Kirim Ulasan 🚀
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-sky-700 to-cyan-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">Siap Bergabung dengan SEAPEDIA?</h2>
          <p className="text-sky-200 text-lg mb-8">Daftar gratis sekarang dan mulai pengalamanmu di marketplace laut terbaik Indonesia.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn-lg btn-white">Daftar Sekarang →</Link>
            <Link to="/products" className="btn-lg btn-outline-white">Lihat Produk</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
