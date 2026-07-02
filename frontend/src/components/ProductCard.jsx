import { useNavigate } from 'react-router-dom'

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
    'from-sky-400 to-cyan-400',
    'from-blue-400 to-sky-500',
    'from-cyan-500 to-teal-500',
    'from-teal-400 to-emerald-400',
    'from-sky-500 to-indigo-500',
    'from-indigo-400 to-sky-400',
  ]
  const gradient = fallbackGradients[id % fallbackGradients.length]

  return (
    <div
      onClick={() => navigate(`/products/${id}`)}
      className="card-hover cursor-pointer overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden bg-sky-50">
        {image ? (
          <img
            src={image}
            alt={name}
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
          <span className="text-5xl">🐠</span>
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
          <span className="text-xs">🏪</span>
          <span className="text-xs text-sky-600 font-medium truncate">
            {store?.name || 'Toko SEAPEDIA'}
          </span>
        </div>

        <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-sky-700 transition-colors">
          {name}
        </h3>

        <p className="text-slate-500 text-xs mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <span className="text-sky-700 font-bold text-base">{formatRupiah(price)}</span>
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
