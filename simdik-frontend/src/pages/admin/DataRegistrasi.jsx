import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Send, User, GraduationCap, FileText, X, ChevronRight } from 'lucide-react'
import api from '../../lib/axios'

const tabs = [
  { id: 'identitas',    label: 'Identitas Diri',          icon: User },
  { id: 'kualifikasi',  label: 'Kualifikasi & Sertifikasi', icon: GraduationCap },
  { id: 'berkas',       label: 'Berkas Unggahan',          icon: FileText },
]

export default function DataRegistrasi() {
  const [list, setList]           = useState([])
  const [selected, setSelected]   = useState(null)
  const [activeTab, setActiveTab] = useState('identitas')
  const [pesan, setPesan]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('pending')

  const fetchList = () => {
    setLoading(true)
    api.get('/admin/registrasi', { params: { status: statusFilter } })
      .then(res => {
        setList(res.data.data || [])
        if (res.data.data?.length > 0 && !selected) {
          setSelected(res.data.data[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [statusFilter])

  const handleVerifikasi = async (status) => {
    if (!selected) return
    setSubmitting(true)
    try {
      await api.patch(`/admin/verifikasi/${selected.id_pendidik}`, {
        status_verifikasi: status,
        catatan_verifikasi: pesan,
      })
      fetchList()
      setSelected(null)
      setPesan('')
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const handleKirimPesan = async () => {
    if (!selected || !pesan.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/admin/registrasi/${selected.id_pendidik}/kirim-pesan`, { pesan })
      setPesan('')
      alert('Pesan berhasil dikirim ke email pendaftar')
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const initials = (nama) => nama?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Dashboard &rsaquo; Data Registrasi</p>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Data Registrasi</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola data registrasi pendidik dan tenaga kependidikan lainnya.</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Left — List */}
        <div className="w-72 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Pending Applicants</h3>
              <span className="bg-[#1a4a6b] text-white text-xs px-2 py-0.5 rounded-full">
                {list.length} Total
              </span>
            </div>
            {/* Filter Status */}
            <div className="flex gap-1">
              {['pending', 'disetujui', 'ditolak'].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setSelected(null) }}
                  className={`flex-1 py-1 text-xs rounded-lg capitalize font-medium transition-all
                    ${statusFilter === s ? 'bg-[#1a4a6b] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <p className="text-center text-sm text-gray-400 py-8">Memuat...</p>
            ) : list.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">Tidak ada data</p>
            ) : list.map(item => (
              <button
                key={item.id_pendidik}
                onClick={() => { setSelected(item); setActiveTab('identitas') }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors
                  ${selected?.id_pendidik === item.id_pendidik ? 'bg-[#1a4a6b]/5 border-l-2 border-[#1a4a6b]' : 'hover:bg-gray-50'}`}
              >
                <div className="w-9 h-9 rounded-full bg-[#1a4a6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials(item.nama)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.nama}</p>
                  <p className="text-xs text-gray-400">Reg: #{item.id_pendidik?.toString().padStart(11, '0')}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Right — Detail */}
        {selected ? (
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#1a4a6b] flex items-center justify-center text-white text-lg font-bold">
                    {initials(selected.nama)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selected.nama}</h2>
                    <p className="text-sm text-gray-400">Calon Pendidik</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-medium uppercase">
                        {selected.verifikasi?.status_verifikasi || 'pending'} verification
                      </span>
                      <span className="text-xs text-gray-400">
                        Submitted: {new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerifikasi('ditolak')}
                    disabled={submitting || selected.status_akun !== 'pending'}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-40"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                  <button
                    onClick={() => handleVerifikasi('disetujui')}
                    disabled={submitting || selected.status_akun !== 'pending'}
                    className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-40"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex-1">
              <div className="flex border-b border-gray-100">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors
                      ${activeTab === tab.id
                        ? 'bg-[#1a4a6b] text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Tab Identitas */}
                {activeTab === 'identitas' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Nomor Induk Kependudukan (NIK)', value: selected.nik },
                      { label: 'Alamat Lengkap', value: selected.alamat },
                      { label: 'Tempat, Tanggal Lahir', value: selected.tempat_lahir ? `${selected.tempat_lahir}, ${selected.tanggal_lahir}` : '—' },
                      { label: 'Jenis Kelamin', value: selected.jenis_kelamin || '—' },
                      { label: 'Status Kepegawaian', value: selected.status_kepegawaian },
                      { label: 'Email', value: selected.email },
                      { label: 'No. HP', value: selected.no_hp || '—' },
                      { label: 'Pendidikan Terakhir', value: selected.pendidikan_terakhir || '—' },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                        <p className="text-sm text-gray-800 font-medium">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Kualifikasi */}
                {activeTab === 'kualifikasi' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <GraduationCap size={16} /> Riwayat Pendidikan Terakhir
                      </h4>
                      <p className="text-sm text-gray-600">{selected.pendidikan_terakhir || 'Belum diisi'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-2">Status Kepegawaian</h4>
                      <span className="bg-[#1a4a6b] text-white text-sm px-3 py-1 rounded-full">
                        {selected.status_kepegawaian}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab Berkas */}
                {activeTab === 'berkas' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'KTP / Identitas', key: 'data_identitas' },
                      { label: 'Ijazah / Kualifikasi', key: 'data_kualifikasi' },
                      { label: 'Sertifikasi', key: 'data_sertifikasi' },
                    ].map((doc, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4">
                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          {selected.dokumen?.[doc.key] ? (
                            <FileText size={32} className="text-gray-400" />
                          ) : (
                            <p className="text-xs text-gray-400">Tidak ada file</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 font-medium">{doc.label}</p>
                          {selected.dokumen?.[doc.key] && (
                            <a
                              href={`http://localhost:8000/storage/${selected.dokumen[doc.key]}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1a4a6b] hover:underline text-xs"
                            >
                              ↓ Unduh
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Revision Feedback */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <FileText size={16} /> Revision Feedback
              </h4>
              <p className="text-xs text-gray-400 mb-3">
                Pesan ini akan dikirim otomatis ke email pendaftar.
              </p>
              <textarea
                value={pesan}
                onChange={e => setPesan(e.target.value)}
                rows={3}
                placeholder="e.g. Please re-upload a clearer scan of the Family Card..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20 resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Notify student via Email
                </label>
                <button
                  onClick={handleKirimPesan}
                  disabled={submitting || !pesan.trim()}
                  className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-40"
                >
                  <Send size={14} /> Send Revision Request
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <p className="text-gray-400 text-sm">Pilih pendaftar dari daftar untuk melihat detail</p>
          </div>
        )}
      </div>
    </div>
  )
}