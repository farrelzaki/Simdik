import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle, AlertCircle, FolderOpen, ChevronRight, Upload, Bell, UserCog } from 'lucide-react'
import api from '../../lib/axios'

export default function PendidikDashboard() {
  const navigate  = useNavigate()
  const [profil, setProfil]     = useState(null)
  const [verifikasi, setVerif]  = useState(null)
  const [notifs, setNotifs]     = useState([])
  const [loading, setLoading]   = useState(true)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    Promise.all([
      api.get('/pendidik/profil'),
      api.get('/pendidik/status-verifikasi'),
    ]).then(([profilRes, verifRes]) => {
      setProfil(profilRes.data.data)
      setVerif(verifRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const initials = (nama) => nama?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PD'

  const statusVerif = verifikasi?.status_akun || 'pending'
  const statusStep  = statusVerif === 'aktif' ? 3 : statusVerif === 'pending' ? 2 : 1
  const stepPct     = statusStep === 3 ? 100 : statusStep === 2 ? 66 : 33

  const notifItems = [
    { icon: '📋', color: 'blue', title: 'SK Jabatan Fungsional Terbit', time: '2 Jam Lalu', desc: 'Dokumen SK Anda telah tersedia di sistem. Silakan unduh untuk arsip.' },
    { icon: '⚠️', color: 'yellow', title: 'Masa Berlaku Sertifikasi', time: 'H-5', desc: 'Sertifikasi Kompetensi akan berakhir. Segera lakukan pembaharuan dokumen.' },
    { icon: 'ℹ️', color: 'green', title: 'Workshop MIS Portal', time: 'Kemarin', desc: 'Undangan pelatihan penggunaan modul terbaru MIS Portal.' },
  ]

  const iconColor = {
    blue:   'bg-blue-50 text-blue-600',
    yellow: 'bg-amber-50 text-amber-600',
    green:  'bg-emerald-50 text-emerald-600',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Memuat data...</div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#054a5c]">Halo, {profil?.nama || user.nama || 'Pendidik'}</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang kembali, pantau status kepegawaian Anda di sini.</p>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-3 gap-5">
        {/* Profil Card */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 bg-[#054a5c] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {initials(profil?.nama)}
              </div>
              {statusVerif === 'aktif' && (
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle size={14} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#054a5c] mb-3">{profil?.nama || '—'}</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: 'Nomor Induk Kepegawaian', value: profil?.nik },
                  { label: 'Unit Kerja',              value: profil?.unit_kerja || profil?.bidang_ajar },
                  { label: 'Jabatan',                 value: profil?.jabatan || profil?.status_kepegawaian },
                  { label: 'Status Kepegawaian',      value: profil?.status_kepegawaian },
                ].map((item, i) => (  
                  <div key={i}>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-gray-700">{item.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Verifikasi */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl
            ${statusVerif === 'aktif' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            {statusVerif === 'aktif' ? '✅' : '⏳'}
          </div>
          <h3 className="font-bold text-gray-800 mb-1">Status Verifikasi</h3>
          <p className="text-xs text-gray-400 mb-3">
            {statusVerif === 'aktif' ? 'Data Anda telah terverifikasi.' : 'Pembaruan data sedang diproses oleh tim pusat.'}
          </p>
          <span className={`inline-block text-sm font-semibold px-5 py-2 rounded-full mb-4
            ${statusVerif === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {statusVerif === 'aktif' ? 'Terverifikasi' : 'Pending Verification'}
          </span>
          <div className="px-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${stepPct}%` }} />
            </div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Langkah {statusStep} Dari 3</p>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-3 gap-5">
        {/* Notifikasi Terbaru */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[#054a5c]">Notifikasi Terbaru</h3>
            <button onClick={() => navigate('/pendidik/notifikasi')}
              className="text-sm font-semibold text-[#054a5c] hover:underline">
              Lihat Semua
            </button>
          </div>
          <div className="space-y-4">
            {notifItems.map((n, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${iconColor[n.color]}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0">{n.time}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-[#054a5c] mb-4 text-sm">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Update Dokumen', icon: Upload,  to: '/pendidik/dokumen',   primary: true  },
              { label: 'Lihat Notifikasi', icon: Bell,  to: '/pendidik/notifikasi', primary: false },
              { label: 'Edit Profil',   icon: UserCog,  to: '/pendidik/profil',    primary: false },
            ].map((action, i) => (
              <button key={i} onClick={() => navigate(action.to)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all
                  ${action.primary
                    ? 'bg-[#054a5c] text-white hover:bg-[#033a47]'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                <span className="flex items-center gap-2">
                  <action.icon size={15} /> {action.label}
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400 uppercase font-bold">
            <span>Terakhir Update</span>
            <span>{profil?.updated_at ? new Date(profil.updated_at).toLocaleDateString('id-ID') : '—'}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-4 px-2">
          {[
            { icon: FileText,    color: 'bg-gray-100 text-gray-600',    val: '3',  label: 'Dokumen Tersimpan', valColor: 'text-gray-800'    },
            { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600', val: profil?.dokumen?.status_kelengkapan === 'lengkap' ? '✓' : '—', label: 'Terverifikasi', valColor: 'text-emerald-600' },
            { icon: AlertCircle, color: 'bg-red-100 text-red-600',       val: '0',  label: 'Butuh Revisi',    valColor: 'text-red-600'     },
            { icon: FolderOpen,  color: 'bg-amber-100 text-amber-600',   val: statusVerif === 'pending' ? '1' : '0', label: 'Dalam Review', valColor: 'text-amber-600'   },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-2">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className={`text-xl font-bold ${s.valColor}`}>{s.val}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}