/**
 * StarRating component.
 * Props: rating (number 1-5), interactive (bool), onChange (fn), size (sm|md|lg)
 */
export default function StarRating({ rating = 0, interactive = false, onChange, size = 'md' }) {
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }
  const cls = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`
            ${cls} leading-none transition-transform duration-100
            ${interactive ? 'cursor-pointer hover:scale-125 active:scale-110' : 'cursor-default'}
            ${star <= rating ? 'text-amber-400' : 'text-slate-200'}
          `}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
