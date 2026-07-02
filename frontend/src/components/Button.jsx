import LoadingSpinner from './LoadingSpinner'

/**
 * Reusable Button component.
 * Variants: primary | secondary | outline | ghost | danger | white | outline-white
 * Sizes: sm | md | lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    white: 'btn-white',
    'outline-white': 'btn-outline-white',
  }[variant] || 'btn-primary'

  const sizeClass = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' }[size] || 'btn-md'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}
