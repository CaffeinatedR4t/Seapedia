export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div className={`${sizes[size]} border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin`}
         style={{ borderWidth: '3px' }} />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
        {spinner}
        <p className="mt-3 text-sky-600 text-sm font-medium">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}
