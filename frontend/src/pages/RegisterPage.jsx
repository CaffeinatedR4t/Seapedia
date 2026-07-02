import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import Input from '../components/Input'
import Button from '../components/Button'

const ROLES = [
  { id: 'buyer',  icon: '🛒', label: 'Pembeli',  desc: 'Belanja produk laut',       color: 'border-sky-400 bg-sky-50 text-sky-700' },
  { id: 'seller', icon: '🏪', label: 'Penjual',  desc: 'Jual produk di tokomu',      color: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { id: 'driver', icon: '🚚', label: 'Driver',   desc: 'Antar pesanan & dapat upah', color: 'border-amber-400 bg-amber-50 text-amber-700' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' })
  const [selectedRoles, setSelectedRoles] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleRole = (roleId) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    )
  }

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username wajib diisi'
    else if (form.username.length < 3) e.username = 'Username minimal 3 karakter'
    else if (form.username.length > 50) e.username = 'Username maksimal 50 karakter'
    if (!form.password) e.password = 'Password wajib diisi'
    else if (form.password.length < 6) e.password = 'Password minimal 6 karakter'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Password tidak cocok'
    if (selectedRoles.length === 0) e.roles = 'Pilih minimal satu peran'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      await client.post('/auth/register', {
        username: form.username,
        password: form.password,
        roles: selectedRoles,
      })
      navigate('/login', { state: { success: `Akun berhasil dibuat! Silakan login dengan username ${form.username}` } })
    } catch (err) {
      const msg = err.response?.data?.error || 'Registrasi gagal. Coba lagi.'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-800 to-cyan-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white">
            <span className="text-4xl">🌊</span>
            <span className="text-3xl font-extrabold">SEAPEDIA</span>
          </Link>
          <p className="text-sky-200 mt-2">Buat akun baru — gratis!</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              name="username"
              placeholder="Pilih username unikmu"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              required
              autoFocus
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 text-sm">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              }
            />

            <Input
              label="Konfirmasi Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            {/* Role Selection */}
            <div>
              <label className="label">
                Pilih Peranmu <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(bisa lebih dari satu)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ id, icon, label, desc, color }) => {
                  const selected = selectedRoles.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      id={`role-${id}`}
                      onClick={() => toggleRole(id)}
                      className={`
                        relative p-3 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer
                        ${selected ? `${color} shadow-sm` : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}
                      `}
                    >
                      {selected && <span className="absolute top-1.5 right-1.5 text-xs">✓</span>}
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="font-semibold text-xs">{label}</div>
                      <div className="text-xs opacity-75 mt-0.5">{desc}</div>
                    </button>
                  )
                })}
              </div>
              {errors.roles && <p className="mt-1.5 text-xs text-red-600">⚠ {errors.roles}</p>}
            </div>

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                ⚠ {apiError}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Buat Akun →
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-sky-600 font-semibold hover:underline">Masuk sekarang</Link>
          </div>
        </div>

        <p className="text-center text-sky-300 text-xs mt-6">© 2024 SEAPEDIA · COMPFEST 18</p>
      </div>
    </div>
  )
}
