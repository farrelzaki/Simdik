import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Headphones } from 'lucide-react'

export default function Pending() {
  const navigate  = useNavigate()
  const user      = JSON.parse(localStorage.getItem('pending_user') || '{}')
  const isVerified = user?.status_akun === 'aktif'

  const handleKembali = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4f2f0] via-[#dbebe9] to-[#cfe6e2] py-12 px-4"
      style={{ backgroundAttachment: 'fixed' }}>
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#054a5c" />
              <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#0e7d71" />
              <path d="M35 40 Q50 25 65 40 L65 65 Q50 75 35 65 Z" fill="#e8a020" />
            </svg>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-[#f4f8fa] rounded-2xl shadow-sm p-8 text-center">
          {isVerified ? (
            <>
              <span className="inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4 shadow-md shadow-emerald-200">
                ✅ Status: Verifikasi Berhasil
              </span>
              <h2 className="text-2xl font-bold text-[#0e7d71]">Verifikasi Anda Berhasil!</h2>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 bg-amber-400 text-black text-sm font-semibold px-4 py-2 rounded-full mb-4">
                ℹ️ Status: Menunggu Verifikasi
              </span>
              <h2 className="text-2xl font-bold text-[#054a5c]">Terima Kasih, Pengajuan Anda Diterima!</h2>
            </>
          )}
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            Mohon cek Email dan WhatsApp secara berkala untuk informasi lanjutan terkait tahapan seleksi selanjutnya.
          </p>
        </div>

        {/* Tracker */}
        <div className="bg-[#f4f8fa] rounded-2xl shadow-sm p-6">
          <div className="relative flex justify-between items-start px-8">
            <div className="absolute top-5 left-[20%] right-[20%] h-0.5 bg-gray-200 z-0" />
            <div className={`absolute top-5 left-[20%] h-0.5 z-0 bg-[#054a5c] transition-all duration-1000
              ${isVerified ? 'w-[70%]' : 'w-[35%]'}`} />

            {[
              { icon: '👤', label: 'Registrasi',          sub: 'Selesai',            active: true  },
              { icon: '📋', label: 'Verifikasi Dokumen',  sub: isVerified ? 'Selesai' : 'Sedang Berlangsung', active: true  },
              { icon: '✅', label: 'Selesai',              sub: isVerified ? 'Sedang Berlangsung' : 'Menunggu', active: isVerified },
            ].map((s, i) => (
              <div key={i} className="relative z-10 text-center px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-lg transition-all
                  ${s.active ? 'bg-[#054a5c] text-white shadow-md shadow-[#054a5c]/20' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                  {s.icon}
                </div>
                <p className={`text-xs font-bold ${s.active ? 'text-[#054a5c]' : 'text-gray-400'}`}>{s.label}</p>
                <p className={`text-xs mt-0.5 ${s.active && !isVerified && i === 1 ? 'text-[#054a5c] font-semibold' : 'text-gray-400'}`}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Profil & Ringkasan */}
        <div className="grid grid-cols-3 gap-4">
          {/* Foto Profil */}
          <div className="bg-[#f4f8fa] rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[#054a5c] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3">
              {user.nama ? user.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PD'}
            </div>
            <p className="font-bold text-[#054a5c] text-sm">{user.nama || '—'}</p>
            <span className="mt-1.5 bg-[#054a5c] text-white text-xs px-3 py-1 rounded-full">
              {user.pendidikan_terakhir || 'Pendidik'}
            </span>
            <p className="text-xs text-gray-400 mt-1.5">ID: REG-{user.id_pendidik?.toString().padStart(7, '0') || '0000000'}</p>
          </div>

          {/* Ringkasan Data */}
          <div className="col-span-2 bg-[#f4f8fa] rounded-2xl shadow-sm p-5">
            <h5 className="font-bold text-[#054a5c] text-sm mb-4">Ringkasan Data Profil</h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: 'Email Aktif',        value: user.email          },
                { label: 'Nomor Telepon',      value: user.no_hp ? `+62 ${user.no_hp}` : '—' },
                { label: 'Status Kepegawaian', value: user.status_kepegawaian },
                { label: 'Pendidikan',         value: user.pendidikan_terakhir },
                { label: 'Alamat Domisili',    value: user.alamat         },
                { label: 'Status Dokumen',     value: '✅ Terunggah'       },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-[#054a5c]">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Helpdesk */}
        <div className="bg-[#f4f8fa] rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#dbebe9] text-[#054a5c] rounded-xl flex items-center justify-center">
                <Headphones size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#054a5c]">Butuh bantuan?</p>
                <p className="text-xs text-gray-500">Hubungi tim helpdesk kami jika ada pertanyaan mengenai berkas.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 text-[#054a5c] text-sm font-semibold rounded-lg hover:bg-gray-50 whitespace-nowrap">
              Hubungi Support
            </button>
          </div>
        </div>

        {/* Tombol Kembali */}
        <div className="text-center pt-2 pb-6">
          <button onClick={handleKembali}
            className="inline-flex items-center gap-2 bg-[#054a5c] text-white px-8 py-3 rounded-full font-medium hover:bg-[#033a47] transition-all hover:-translate-y-0.5">
            <ArrowLeft size={15} /> Kembali ke Login
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">© 2024 YAYASAN IHSAN TAUHID</p>
      </div>
    </div>
  )
}