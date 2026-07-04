import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const successMsg = location.state?.success

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username.trim() || !form.password) {
      setError('Username dan password wajib diisi')
      return
    }
    setLoading(true)
    try {
      const res = await client.post('/auth/login', form)
      const { token, user, requires_role_selection } = res.data
      login(token, user)

      if (requires_role_selection) {
        navigate('/role-selection', { replace: true })
      } else {
        const roleDash = { buyer: '/buyer/dashboard', seller: '/seller/dashboard', driver: '/driver/dashboard', admin: '/admin/dashboard' }
        navigate(from || roleDash[user.active_role] || '/', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa username dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 text-ink-900 hover:opacity-80 transition-opacity">
            <img src="/images/seapedia_nobg.png" alt="SEAPEDIA" className="w-12 h-12 object-contain" />
            <span className="text-4xl font-extrabold font-display tracking-tight text-ink-900">SEAPEDIA</span>
          </Link>
          <p className="text-ink-500 mt-3 text-sm font-medium">Selamat datang kembali! Silakan masuk ke akunmu</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-ocean-lg border border-paper-100">
          {successMsg && (
            <div className="mb-5 p-4 bg-success/10 border border-success/30 rounded-xl text-success text-sm flex items-center gap-3 font-medium">
              <CheckCircle size={18} className="text-success" /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              name="username"
              placeholder="Masukkan username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              autoFocus
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {error && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm font-medium flex items-center gap-2">
                <span className="text-error">⚠</span> {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Masuk →
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-500 font-medium">
            Belum punya akun?{' '}
            <Link to="/register" className="text-coral-600 font-semibold hover:text-coral-700 hover:underline transition-colors">Daftar sekarang</Link>
          </div>
        </div>

        <p className="text-center text-ink-500/60 text-xs mt-8 font-medium">
          &copy; {new Date().getFullYear()} SEAPEDIA &middot; COMPFEST 18
        </p>
      </div>
    </div>
  )
}
