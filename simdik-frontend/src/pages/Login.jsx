import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, HelpCircle, ArrowRight } from 'lucide-react'
import api from '../lib/axios'

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole]         = useState('pendidik')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password, role })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role',  res.data.role)
      localStorage.setItem('user',  JSON.stringify(res.data.user))

      if (res.data.role === 'tata_usaha') {
        navigate('/admin/dashboard')
      } else {
        navigate('/pendidik/dashboard')
      }
    } catch (err) {
      const status = err.response?.status
      const data   = err.response?.data
      if (status === 403 && data?.status === 'pending') {
        localStorage.setItem('pending_user', JSON.stringify(data.data))
        navigate('/pending')
      } else {
        setError(data?.message || 'Login gagal, periksa kembali kredensial Anda')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b8d4e8] via-[#d4e8d8] to-[#c8dce8] flex flex-col items-center justify-center p-4">

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#1a4a6b" />
              <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#2a6a9b" />
              <path d="M35 40 Q50 25 65 40 L65 65 Q50 75 35 65 Z" fill="#e8a020" />
              <path d="M42 35 Q50 20 58 35" fill="none" stroke="#4ab8d8" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a4a6b]">Selamat Datang</h1>
          <p className="text-sm text-gray-400 mt-1">Management Information System</p>
        </div>

        {/* Switch Role */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { value: 'pendidik', label: 'Pendidik/Tendik' },
            { value: 'tata_usaha',    label: 'Tata Usaha' },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => { setRole(r.value); setError('') }}
              className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all
                ${role === r.value
                  ? 'bg-[#1a4a6b] text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Email atau Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@ihsantauhid.sch.id"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20 focus:border-[#1a4a6b]/30"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20 focus:border-[#1a4a6b]/30"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <button type="button" className="text-xs text-[#1a4a6b] font-medium hover:underline">
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1a4a6b] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#15395a] transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Memproses...' : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Register link — hanya untuk pendidik */}
        {role === 'pendidik' && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#1a4a6b] font-semibold hover:underline">
              Registrasi di sini
            </Link>
          </p>
        )}

        {/* Bantuan */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-3">Bantuan</p>
          <div className="flex justify-center gap-4">
            <button className="text-gray-400 hover:text-gray-600">
              <HelpCircle size={20} />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 mt-6">© 2024 YAYASAN IHSAN TAUHID</p>
    </div>
  )
}