import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import client from '../api/client'
import ProductCard from '../components/ProductCard'
import StarRating from '../components/StarRating'
import Button from '../components/Button'
import { Fish, Store, Smile, Star, ShoppingCart, Truck, Settings, LifeBuoy, Waves, CheckCircle, ShoppingBag, FileText, Rocket } from 'lucide-react'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

function Preloader({ onComplete }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)", scale: 1, opacity: 1 }}
        animate={{ 
          clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)", "inset(0 0 0 0)", "inset(0 0 0 0)", "inset(0 0 0 0)", "inset(0 0 0 0)"], 
          scale: [1, 1, 1.15, 1, 1.15, 0.95],
          opacity: [1, 1, 1, 1, 1, 0]
        }}
        transition={{ 
          duration: 3.0, 
          times: [0, 0.35, 0.5, 0.65, 0.85, 1],
          ease: "easeInOut" 
        }}
        onAnimationComplete={onComplete}
        className="w-16 h-16 md:w-20 md:h-20"
      >
        <img src="/images/seapedia_nobg.png" alt="Loading SEAPEDIA" className="w-full h-full object-contain" />
      </motion.div>
    </motion.div>
  )
}

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
  { value: '1.000+', label: 'Produk Laut', icon: <Fish size={32} className="mx-auto mb-2 text-coral-600" /> },
  { value: '500+',   label: 'Penjual Aktif', icon: <Store size={32} className="mx-auto mb-2 text-success" /> },
  { value: '10rb+',  label: 'Pembeli Puas', icon: <Smile size={32} className="mx-auto mb-2 text-gold-500" /> },
  { value: '4.9',   label: 'Rating Rata-rata', icon: <Star size={32} className="mx-auto mb-2 text-gold-500" /> },
]

const ROLES = [
  { icon: <ShoppingCart size={32} />, title: 'Pembeli', color: 'from-coral-600 to-coral-700', desc: 'Temukan produk laut terbaik. Bayar pakai dompet digital, nikmati berbagai metode pengiriman.' },
  { icon: <Store size={32} />, title: 'Penjual', color: 'from-success to-success', desc: 'Buka toko online-mu, kelola produk, dan raih penghasilan dari ribuan pembeli.' },
  { icon: <Truck size={32} />, title: 'Driver', color: 'from-gold-500 to-gold-500', desc: 'Ambil pekerjaan pengiriman, antar pesanan, dan kumpulkan penghasilan harianmu.' },
  { icon: <Settings size={32} />, title: 'Admin', color: 'from-ink-700 to-ink-700', desc: 'Kelola seluruh ekosistem marketplace: produk, pengguna, voucher, dan operasional.' },
]

export default function LandingPage() {
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [preloading, setPreloading] = useState(() => !sessionStorage.getItem('seapedia_preloader_shown'))
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
    <>
      <AnimatePresence>
        {preloading && <Preloader onComplete={() => {
          setPreloading(false)
          sessionStorage.setItem('seapedia_preloader_shown', 'true')
        }} />}
      </AnimatePresence>
      <div>
        {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative bg-ink-900 text-white overflow-hidden min-h-[92vh] flex flex-col justify-end pb-32 sm:pb-40">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/aquarium_remix_scene.webm" type="video/webm" />
        </video>
        
        {/* Dark Overlay for better button contrast */}
        <div className="absolute inset-0 bg-ink-900 opacity-20 pointer-events-none" />

        <div className="relative z-10 animate-fade-in max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="btn-lg btn-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
              <ShoppingBag size={20} /> Jelajahi Produk
            </Link>
            <motion.div whileHover="hover" initial="initial" className="inline-block">
              <Link to="/register" className="relative overflow-hidden btn-lg bg-ink-900/40 backdrop-blur-md border border-white/40 shadow-lg block">
                <motion.div
                  className="absolute inset-0 bg-white origin-left"
                  variants={{
                    initial: { scaleX: 0 },
                    hover: { scaleX: 1 }
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
                <motion.span 
                  className="relative z-10 flex items-center gap-1 font-semibold"
                  variants={{
                    initial: { color: "#ffffff" },
                    hover: { color: "#1C2A36" }
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  Daftar Gratis →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" className="w-full fill-white" preserveAspectRatio="none" style={{ height: '60px' }}>
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-paper-200 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="text-center">
              {icon}
              <div className="text-2xl font-extrabold text-ink-900">{value}</div>
              <div className="text-sm text-ink-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="section bg-paper-100">
        <div className="container-xl">
          <h2 className="section-title flex items-center justify-center gap-2">Produk Unggulan <Fish className="text-coral-600" /></h2>
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
          <h2 className="section-title flex items-center justify-center gap-2">Kenapa SEAPEDIA? <Waves className="text-coral-600" /></h2>
          <p className="section-subtitle">Satu platform untuk semua peran di ekosistem marketplace laut Indonesia</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map(({ icon, title, color, desc }) => (
              <div key={title} className="card-hover bg-paper-100 p-6 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mx-auto mb-4 shadow-ocean`}>
                  {icon}
                </div>
                <h3 className="font-bold text-ink-900 mb-2">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────── */}
      <section id="reviews" className="section bg-paper-100">
        <div className="container-xl">
          <h2 className="section-title flex items-center justify-center gap-2">Apa Kata Mereka? <Star className="text-gold-500" /></h2>
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
                  <p className="text-ink-700 text-sm mt-3 leading-relaxed line-clamp-4">
                    "{r.comment}"
                  </p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-sky-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                      {r.reviewer_name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-ink-700">{r.reviewer_name}</span>
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
            <h2 className="section-title flex items-center justify-center gap-2">Bagikan Pengalamanmu <FileText className="text-coral-600" /></h2>
            <p className="section-subtitle">Ceritakan pengalamanmu menggunakan SEAPEDIA</p>

            <div className="card p-8">
              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle size={16} /> Ulasan berhasil dikirim! Terima kasih.
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
                    <span className="text-sm text-ink-500">{form.rating > 0 ? `${form.rating}/5 bintang` : 'Klik bintang untuk memberi rating'}</span>
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
                  <p className="text-sm text-red-600 flex items-center gap-1">Error: {formError}</p>
                )}

                <Button type="submit" loading={submitting} size="lg" className="w-full flex items-center justify-center gap-2">
                  Kirim Ulasan <Rocket size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="bg-coral-100 py-16 px-4 border-t border-paper-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-900 mb-4">Siap Bergabung dengan SEAPEDIA?</h2>
          <p className="text-ink-700 text-lg mb-8">Daftar gratis sekarang dan mulai pengalamanmu di marketplace laut terbaik Indonesia.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn-lg btn-primary shadow-sm hover:shadow-md transition-shadow">Daftar Sekarang →</Link>
            <Link to="/products" className="btn-lg border-2 border-ink-900 text-ink-900 font-semibold hover:bg-ink-900 hover:text-white transition-colors duration-200">Lihat Produk</Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
