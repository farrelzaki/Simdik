import { useState } from 'react'
import { Shield, Eye, EyeOff, HelpCircle } from 'lucide-react'
import api from '../../lib/axios'

export default function Pengaturan() {
  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [konfirmasi, setKonfirmasi]     = useState('')
  const [showLama, setShowLama]         = useState(false)
  const [showBaru, setShowBaru]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [success, setSuccess]           = useState('')
  const [error, setError]               = useState('')

  const handleGantiPassword = async (e) => {
    e.preventDefault()
    if (passwordBaru !== konfirmasi) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    if (passwordBaru.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }
    setSuccess('')
    setError('')
    setLoading(true)
    try {
      await api.post('/admin/pengaturan/ganti-password', {
        password_lama:              passwordLama,
        password_baru:              passwordBaru,
        password_baru_confirmation: konfirmasi,
      })
      setSuccess('Password berhasil diperbarui')
      setPasswordLama('')
      setPasswordBaru('')
      setKonfirmasi('')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui password')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20"

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola keamanan akun Tata Usaha Anda.</p>
      </div>

      {/* Keamanan Akun */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#1a4a6b] rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Keamanan Akun</h3>
            <p className="text-xs text-gray-400">Perbarui password akun Tata Usaha</p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 border border-emerald-100">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleGantiPassword} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password Saat Ini</label>
            <div className="relative">
              <input type={showLama ? 'text' : 'password'} value={passwordLama}
                onChange={e => setPasswordLama(e.target.value)} required placeholder="••••••••"
                className={inputCls + ' pr-10'} />
              <button type="button" onClick={() => setShowLama(!showLama)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showLama ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password Baru</label>
            <div className="relative">
              <input type={showBaru ? 'text' : 'password'} value={passwordBaru}
                onChange={e => setPasswordBaru(e.target.value)} required placeholder="Min. 8 karakter"
                className={inputCls + ' pr-10'} />
              <button type="button" onClick={() => setShowBaru(!showBaru)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showBaru ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Konfirmasi Password Baru</label>
            <input type="password" value={konfirmasi}
              onChange={e => setKonfirmasi(e.target.value)} required placeholder="Ulangi password baru"
              className={inputCls} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#1a4a6b] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-60">
            {loading ? 'Memperbarui...' : 'Perbarui Password'}
          </button>
        </form>
      </div>


    </div>
  )
}