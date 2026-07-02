/**
 * Reusable Card component.
 * Props: children, className, hover, onClick, glass
 */
export default function Card({ children, className = '', hover = false, glass = false, onClick }) {
  const base = glass ? 'card-glass' : hover ? 'card-hover' : 'card'
  return (
    <div
      className={`${base} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
