import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-800 to-cyan-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white">
            <span className="text-4xl">🌊</span>
            <span className="text-3xl font-extrabold">SEAPEDIA</span>
          </Link>
          <p className="text-sky-200 mt-2">Masuk ke akunmu</p>
        </div>

        <div className="card p-8">
          {successMsg && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
              ✅ {successMsg}
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
                  className="text-slate-400 hover:text-slate-600 text-sm">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              }
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                ⚠ {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Masuk →
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link to="/register" className="text-sky-600 font-semibold hover:underline">Daftar sekarang</Link>
          </div>
        </div>

        <p className="text-center text-sky-300 text-xs mt-6">
          © 2024 SEAPEDIA · COMPFEST 18
        </p>
      </div>
    </div>
  )
}
