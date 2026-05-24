import { useState } from 'react'
import { Shield, Globe, Bell, Lock, Eye, EyeOff, HelpCircle } from 'lucide-react'
import api from '../../lib/axios'

export default function Pengaturan() {
  const [passwordLama, setPasswordLama]   = useState('')
  const [passwordBaru, setPasswordBaru]   = useState('')
  const [showLama, setShowLama]           = useState(false)
  const [showBaru, setShowBaru]           = useState(false)
  const [loading, setLoading]             = useState(false)
  const [success, setSuccess]             = useState('')
  const [error, setError]                 = useState('')
  const [emailNotif, setEmailNotif]       = useState(true)
  const [pushNotif, setPushNotif]         = useState(false)
  const [visibilitas, setVisibilitas]     = useState('publik')

  const handleGantiPassword = async (e) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    setLoading(true)
    try {
      await api.post('/admin/pengaturan/ganti-password', {
        password_lama: passwordLama,
        password_baru: passwordBaru,
        password_baru_confirmation: passwordBaru,
      })
      setSuccess('Password berhasil diperbarui')
      setPasswordLama('')
      setPasswordBaru('')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui password')
    } finally {
      setLoading(false)
    }
  }

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#1a4a6b]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola keamanan dan preferensi personal Anda.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Keamanan Akun */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#1a4a6b] rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Keamanan Akun</h3>
              <p className="text-xs text-gray-400">Terakhir diubah: 3 bulan yang lalu</p>
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
                <input
                  type={showLama ? 'text' : 'password'}
                  value={passwordLama}
                  onChange={e => setPasswordLama(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20"
                />
                <button type="button" onClick={() => setShowLama(!showLama)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showLama ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password Baru</label>
              <div className="relative">
                <input
                  type={showBaru ? 'text' : 'password'}
                  value={passwordBaru}
                  onChange={e => setPasswordBaru(e.target.value)}
                  required
                  placeholder="Min. 8 karakter"
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20"
                />
                <button type="button" onClick={() => setShowBaru(!showBaru)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showBaru ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a4a6b] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-60"
            >
              {loading ? 'Memperbarui...' : 'Perbarui Password'}
            </button>
          </form>
        </div>

        {/* Bahasa */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Globe size={18} className="text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Bahasa</h3>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>🇮🇩</span> Indonesia
            </div>
            <button className="text-sm text-[#1a4a6b] font-medium hover:underline">Ubah</button>
          </div>
          <p className="text-xs text-gray-400 mt-3">Zona Waktu: (GMT+07:00) Jakarta</p>
        </div>

        {/* Preferensi Notifikasi */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Bell size={18} className="text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Preferensi Notifikasi</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">✉️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Notifikasi</p>
                  <p className="text-xs text-gray-400">Laporan mingguan & tugas baru</p>
                </div>
              </div>
              <Toggle value={emailNotif} onChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">📱</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Push Notifikasi</p>
                  <p className="text-xs text-gray-400">Pesan instan & alert sistem</p>
                </div>
              </div>
              <Toggle value={pushNotif} onChange={setPushNotif} />
            </div>
          </div>
        </div>

        {/* Privasi & Data */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Lock size={18} className="text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Privasi & Data</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Visibilitas Profil</p>
              <p className="text-xs text-gray-400 mb-2">Tampilkan profil Anda ke pendidik lain dalam jaringan.</p>
              <div className="flex gap-2">
                {['publik', 'privat'].map(v => (
                  <button
                    key={v}
                    onClick={() => setVisibilitas(v)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition-all
                      ${visibilitas === v ? 'bg-[#1a4a6b] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-red-600 mb-1">Hapus Akun</p>
              <p className="text-xs text-gray-400 mb-2">Permanen menghapus semua data Anda.</p>
              <button className="px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50">
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bantuan */}
      <div className="bg-gradient-to-r from-[#1a4a6b] to-[#2a6a9b] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white mb-1">Punya pertanyaan?</h3>
          <p className="text-sm text-white/60">Bantuan teknis kami tersedia 24/7 untuk mendukung aktivitas mengajar Anda.</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-[#1a4a6b] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 flex-shrink-0">
          <HelpCircle size={15} /> Hubungi Pusat Bantuan
        </button>
      </div>
    </div>
  )
}