import { useState } from 'react'
import { Shield, Globe, Bell, Lock, Eye, EyeOff, HelpCircle } from 'lucide-react'
import api from '../../lib/axios'

export default function PendidikPengaturan() {
  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [konfirmasi, setKonfirmasi]     = useState('')
  const [showLama, setShowLama]         = useState(false)
  const [showBaru, setShowBaru]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [success, setSuccess]           = useState('')
  const [error, setError]               = useState('')
  const [emailNotif, setEmailNotif]     = useState(true)
  const [pushNotif, setPushNotif]       = useState(false)
  const [visibilitas, setVisibilitas]   = useState('publik')

  const handleGantiPassword = async (e) => {
    e.preventDefault()
    if (passwordBaru !== konfirmasi) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    setSuccess('')
    setError('')
    setLoading(true)
    try {
      await api.put('/pendidik/profil', {
        password:              passwordBaru,
        password_confirmation: konfirmasi,
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

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#054a5c]' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#054a5c]/20"

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#054a5c]">Pengaturan Akun</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola keamanan dan preferensi personal Anda.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Keamanan Akun */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#054a5c] rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Keamanan Akun</h3>
              <p className="text-xs text-gray-400">Terakhir diubah: 3 bulan yang lalu</p>
            </div>
          </div>

          {success && <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 border border-emerald-100">{success}</div>}
          {error   && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">{error}</div>}

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
              className="w-full bg-[#054a5c] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#033a47] disabled:opacity-60">
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
            <button className="text-sm text-[#054a5c] font-medium hover:underline">Ubah</button>
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
            {[
              { label: 'Email Notifikasi', sub: 'Laporan mingguan & tugas baru', val: emailNotif, set: setEmailNotif, icon: '✉️' },
              { label: 'Push Notifikasi',  sub: 'Pesan instan & alert sistem',   val: pushNotif,  set: setPushNotif,  icon: '📱' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">{item.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
                <Toggle value={item.val} onChange={item.set} />
              </div>
            ))}
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
                  <button key={v} onClick={() => setVisibilitas(v)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition-all
                      ${visibilitas === v ? 'bg-[#054a5c] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
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
      <div className="bg-gradient-to-r from-[#054a5c] to-[#0e7d71] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white mb-1">Punya pertanyaan?</h3>
          <p className="text-sm text-white/60">Bantuan teknis kami tersedia 24/7 untuk mendukung aktivitas mengajar Anda.</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-[#054a5c] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 flex-shrink-0">
          <HelpCircle size={15} /> Hubungi Pusat Bantuan
        </button>
      </div>
    </div>
  )
}