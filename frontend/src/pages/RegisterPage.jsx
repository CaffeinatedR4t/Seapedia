import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Store, Truck, Eye, EyeOff, Check } from 'lucide-react'
import client from '../api/client'
import Input from '../components/Input'
import Button from '../components/Button'

const ROLES = [
  { id: 'buyer',  icon: <ShoppingCart size={24} />, label: 'Pembeli',  desc: 'Belanja produk laut',       color: 'border-info bg-info/10 text-info' },
  { id: 'seller', icon: <Store size={24} />, label: 'Penjual',  desc: 'Jual produk di tokomu',      color: 'border-success bg-success/10 text-success' },
  { id: 'driver', icon: <Truck size={24} />, label: 'Driver',   desc: 'Antar pesanan & dapat upah', color: 'border-warning bg-warning/10 text-warning' },
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
    <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4 font-body py-12">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 text-ink-900 hover:opacity-80 transition-opacity">
            <img src="/images/seapedia_nobg.png" alt="SEAPEDIA" className="w-12 h-12 object-contain" />
            <span className="text-4xl font-extrabold font-display tracking-tight text-ink-900">SEAPEDIA</span>
          </Link>
          <p className="text-ink-500 mt-3 text-sm font-medium">Buat akun baru - gratis!</p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-ocean-lg border border-paper-100">
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
                  className="text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                        relative p-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer hover:-translate-y-1
                        ${selected ? `${color} shadow-md border-opacity-100` : 'border-paper-200 bg-white text-ink-500 hover:border-paper-300 hover:shadow-sm'}
                      `}
                    >
                      {selected && <Check size={14} className="absolute top-1.5 right-1.5" />}
                      <div className="flex justify-center mb-1">{icon}</div>
                      <div className="font-semibold text-xs">{label}</div>
                      <div className="text-xs opacity-75 mt-0.5">{desc}</div>
                    </button>
                  )
                })}
              </div>
              {errors.roles && <p className="mt-1.5 text-xs text-red-600">⚠ {errors.roles}</p>}
            </div>

            {apiError && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm font-medium flex items-center gap-2">
                <span className="text-error">⚠</span> {apiError}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Buat Akun →
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-ink-500 font-medium">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-coral-600 font-semibold hover:text-coral-700 hover:underline transition-colors">Masuk sekarang</Link>
          </div>
        </div>

        <p className="text-center text-ink-500/60 text-xs mt-8 font-medium">&copy; {new Date().getFullYear()} SEAPEDIA &middot; COMPFEST 18</p>
      </div>
    </div>
  )
}
