import { useState } from 'react'
import { Shield, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react'
import api from '../../lib/axios'
import { useNavigate } from 'react-router-dom'

export default function PendidikPengaturan() {
  const navigate = useNavigate()

  // Password
  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [konfirmasi, setKonfirmasi]     = useState('')
  const [showLama, setShowLama]         = useState(false)
  const [showBaru, setShowBaru]         = useState(false)
  const [loadingPass, setLoadingPass]   = useState(false)
  const [successPass, setSuccessPass]   = useState('')
  const [errorPass, setErrorPass]       = useState('')

  // Hapus akun
  const [showHapus, setShowHapus]       = useState(false)
  const [alasanHapus, setAlasanHapus]   = useState('')
  const [loadingHapus, setLoadingHapus] = useState(false)
  const [successHapus, setSuccessHapus] = useState('')
  const [errorHapus, setErrorHapus]     = useState('')

  const handleGantiPassword = async (e) => {
    e.preventDefault()
    if (passwordBaru !== konfirmasi) {
      setErrorPass('Konfirmasi password tidak cocok')
      return
    }
    if (passwordBaru.length < 8) {
      setErrorPass('Password minimal 8 karakter')
      return
    }
    setSuccessPass('')
    setErrorPass('')
    setLoadingPass(true)
    try {
      await api.put('/pendidik/profil', {
        password:              passwordBaru,
        password_confirmation: konfirmasi,
      })
      setSuccessPass('Password berhasil diperbarui')
      setPasswordLama('')
      setPasswordBaru('')
      setKonfirmasi('')
    } catch (err) {
      setErrorPass(err.response?.data?.message || 'Gagal memperbarui password')
    } finally {
      setLoadingPass(false)
    }
  }

  const handleHapusAkun = async () => {
    setLoadingHapus(true)
    setErrorHapus('')
    try {
      await api.post('/pendidik/hapus-akun', { alasan: alasanHapus })
      setSuccessHapus('Request penghapusan akun berhasil diajukan. Admin akan meninjau dan menghubungi Anda.')
      setShowHapus(false)
      setAlasanHapus('')
    } catch (err) {
      setErrorHapus(err.response?.data?.message || 'Gagal mengajukan request')
    } finally {
      setLoadingHapus(false)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#054a5c]/20"

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#054a5c]">Pengaturan Akun</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola keamanan akun Anda.</p>
      </div>

      {/* Keamanan Akun */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#054a5c] rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Keamanan Akun</h3>
            <p className="text-xs text-gray-400">Perbarui password akun Anda</p>
          </div>
        </div>

        {successPass && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 border border-emerald-100">
            {successPass}
          </div>
        )}
        {errorPass && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {errorPass}
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
          <button type="submit" disabled={loadingPass}
            className="w-full bg-[#054a5c] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#033a47] disabled:opacity-60">
            {loadingPass ? 'Memperbarui...' : 'Perbarui Password'}
          </button>
        </form>
      </div>

      {/* Hapus Akun */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Hapus Akun</h3>
            <p className="text-xs text-gray-400">Request penghapusan akan dikirim ke admin untuk diverifikasi</p>
          </div>
        </div>

        {successHapus && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 border border-emerald-100">
            {successHapus}
          </div>
        )}
        {errorHapus && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {errorHapus}
          </div>
        )}

        {!showHapus ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Menghapus akun akan menghilangkan semua data Anda secara permanen.
              Request penghapusan akan diverifikasi terlebih dahulu oleh admin.
            </p>
            <button onClick={() => setShowHapus(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50">
              <Trash2 size={14} /> Ajukan Penghapusan Akun
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">
                Tindakan ini tidak dapat dibatalkan setelah disetujui admin.
                Semua data kepegawaian Anda akan dihapus secara permanen.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Alasan Penghapusan (opsional)
              </label>
              <textarea value={alasanHapus} onChange={e => setAlasanHapus(e.target.value)}
                rows={3} placeholder="Tuliskan alasan Anda ingin menghapus akun..."
                className={inputCls + ' resize-none'} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowHapus(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleHapusAkun} disabled={loadingHapus}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60">
                {loadingHapus ? 'Mengajukan...' : 'Kirim Request Hapus Akun'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}