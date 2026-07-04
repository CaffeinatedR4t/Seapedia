import { useNavigate } from 'react-router-dom'
import { Fish, Store } from 'lucide-react'

const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

/**
 * ProductCard component.
 * Props: product { id, name, description, price, stock, image_url, store }
 */
export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { id, name, description, price, stock, image_url: image, store } = product

  const fallbackGradients = [
    'from-coral-400 to-coral-600',
    'from-ink-400 to-ink-600',
    'from-success/70 to-success',
    'from-success/60 to-success/80',
    'from-ink-500 to-ink-700',
    'from-ink-400 to-ink-500',
  ]
  const gradient = fallbackGradients[id % fallbackGradients.length]

  return (
    <div
      onClick={() => navigate(`/products/${id}`)}
      className="card-hover cursor-pointer overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden bg-white">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          style={{ display: image ? 'none' : 'flex' }}
        >
          <Fish className="w-12 h-12 text-white/50" />
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {stock === 0 ? (
            <span className="badge bg-red-100 text-red-700">Habis</span>
          ) : stock <= 5 ? (
            <span className="badge bg-amber-100 text-amber-700">Stok {stock}</span>
          ) : null}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Store Badge */}
        <div className="flex items-center gap-1.5 mb-2">
          <Store size={14} className="text-ink-500" />
          <span className="text-xs text-coral-600 font-medium truncate">
            {store?.name || 'Toko SEAPEDIA'}
          </span>
        </div>

        <h3 className="font-semibold text-ink-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-ink-900 transition-colors">
          {name}
        </h3>

        <p className="text-ink-500 text-xs mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <span className="text-ink-900 font-bold text-base">{formatRupiah(price)}</span>
          <button
            className="text-xs btn-sm btn-outline py-1 px-3"
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${id}`) }}
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  )
}
