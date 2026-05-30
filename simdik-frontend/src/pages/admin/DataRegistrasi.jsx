import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Send, User, GraduationCap, FileText, ChevronRight, X, AlertTriangle } from 'lucide-react'
import api from '../../lib/axios'
import { downloadFile, previewFile, isImage } from '../../lib/fileHelper'

// Komponen untuk preview satu dokumen
function DokumenPreview({ path, label }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    if (!path) return
    setLoadingPreview(true)
    previewFile(path, setPreviewUrl).finally(() => setLoadingPreview(false))
  }, [path])

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {loadingPreview ? (
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#1a4a6b] rounded-full animate-spin" />
        ) : previewUrl && isImage(path) ? (
          <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
        ) : previewUrl ? (
          <div className="text-center">
            <FileText size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">PDF Document</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Tidak ada file</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        {path && (
          <button
            onClick={() => downloadFile(path, label)}
            className="text-[#1a4a6b] hover:underline text-xs flex items-center gap-1"
          >
            ↓ Unduh
          </button>
        )}
      </div>
    </div>
  )
}

const tabs = [
  { id: 'identitas', label: 'Identitas Diri', icon: User },
  { id: 'kualifikasi', label: 'Kualifikasi & Sertifikasi', icon: GraduationCap },
  { id: 'berkas', label: 'Berkas Unggahan', icon: FileText },
]


export default function DataRegistrasi() {
  const [list, setList] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('identitas')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('pending')

  // Popup tolak
  const [showTolakModal, setShowTolakModal] = useState(false)
  const [catatanTolak, setCatatanTolak] = useState('')

  const fetchList = () => {
    setLoading(true)
    api.get('/admin/registrasi', { params: { status: statusFilter } })
      .then(res => {
        const data = res.data.data || []
        setList(data)
        if (data.length > 0 && !selected) setSelected(data[0])
        else if (data.length === 0) setSelected(null)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [statusFilter])

  const handleApprove = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await api.patch(`/admin/verifikasi/${selected.id_pendidik}`, {
        status_verifikasi: 'disetujui',
        catatan_verifikasi: '',
      })
      fetchList()
      setSelected(null)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const handleTolak = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await api.patch(`/admin/verifikasi/${selected.id_pendidik}`, {
        status_verifikasi: 'ditolak',
        catatan_verifikasi: catatanTolak,
      })
      setShowTolakModal(false)
      setCatatanTolak('')
      fetchList()
      setSelected(null)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }



  const initials = (nama) => nama?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-700',
      aktif: 'bg-emerald-100 text-emerald-700',
      ditolak: 'bg-red-100 text-red-600',
    }
    return map[status] || map.pending
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 mb-1">Dashboard › Data Registrasi</p>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Data Registrasi</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola data registrasi pendidik dan tenaga kependidikan.</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Left List */}
        <div className="w-72 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Daftar Pendaftar</h3>
              <span className="bg-[#1a4a6b] text-white text-xs px-2 py-0.5 rounded-full">{list.length} Total</span>
            </div>
            <div className="flex gap-1">
              {[
                { key: 'pending', label: 'Pending' },
                { key: 'disetujui', label: 'Disetujui' },
                { key: 'ditolak', label: 'Ditolak' },
              ].map(s => (
                <button key={s.key}
                  onClick={() => { setStatusFilter(s.key); setSelected(null) }}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium transition-all
                    ${statusFilter === s.key ? 'bg-[#1a4a6b] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {s.label}
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
              <button key={item.id_pendidik}
                onClick={() => { setSelected(item); setActiveTab('identitas') }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors
                  ${selected?.id_pendidik === item.id_pendidik
                    ? 'bg-[#1a4a6b]/5 border-l-2 border-[#1a4a6b]'
                    : 'hover:bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-full bg-[#1a4a6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials(item.nama)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.nama}</p>
                  <p className="text-xs text-gray-400">
                    Reg: #{item.id_pendidik?.toString().padStart(11, '0')}
                  </p>
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Detail */}
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
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium uppercase ${statusBadge(selected.status_akun)}`}>
                        {selected.status_akun === 'aktif' ? 'Disetujui' : selected.status_akun}
                      </span>
                      <span className="text-xs text-gray-400">
                        Submitted: {new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {selected.status_akun === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => { setShowTolakModal(true); setCatatanTolak('') }}
                      disabled={submitting}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-40">
                      <XCircle size={15} /> Reject
                    </button>
                    <button onClick={handleApprove} disabled={submitting}
                      className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-40">
                      <CheckCircle size={15} /> Approve
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex-1">
              <div className="flex border-b border-gray-100">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors
                      ${activeTab === tab.id ? 'bg-[#1a4a6b] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Identitas */}
                {activeTab === 'identitas' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'NIK', value: selected.nik },
                      { label: 'Email', value: selected.email },
                      { label: 'No. HP', value: selected.no_hp },
                      { label: 'Tempat Lahir', value: selected.tempat_lahir },
                      {
                        label: 'Tanggal Lahir', value: selected.tanggal_lahir
                          ? new Date(selected.tanggal_lahir).toLocaleDateString('id-ID')
                          : '—'
                      },
                      { label: 'Jenis Kelamin', value: selected.jenis_kelamin },
                      { label: 'Status Kepegawaian', value: selected.status_kepegawaian },
                      { label: 'Pendidikan Terakhir', value: selected.pendidikan_terakhir },
                      { label: 'Jabatan', value: selected.jabatan },
                      { label: 'Bidang Ajar', value: selected.bidang_ajar },
                      { label: 'Unit Kerja', value: selected.unit_kerja },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                        <p className="text-sm text-gray-800 font-medium">{item.value || '—'}</p>
                      </div>
                    ))}
                    <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Alamat</p>
                      <p className="text-sm text-gray-800 font-medium">{selected.alamat || '—'}</p>
                    </div>
                  </div>
                )}

                {/* Kualifikasi */}
                {activeTab === 'kualifikasi' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <GraduationCap size={16} /> Pendidikan Terakhir
                      </h4>
                      <p className="text-sm text-gray-600">{selected.pendidikan_terakhir || 'Belum diisi'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-2">Bidang Ajar</h4>
                      <p className="text-sm text-gray-600">{selected.bidang_ajar || 'Belum diisi'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-2">Status Kepegawaian</h4>
                      <span className="bg-[#1a4a6b] text-white text-sm px-3 py-1 rounded-full">
                        {selected.status_kepegawaian}
                      </span>
                    </div>
                  </div>
                )}

                {/* Berkas */}
                {activeTab === 'berkas' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'KTP / Identitas',      key: 'data_identitas'   },
                      { label: 'Ijazah / Kualifikasi', key: 'data_kualifikasi' },
                      { label: 'Sertifikasi',          key: 'data_sertifikasi' },
                    ].map((doc, i) => (
                      <DokumenPreview
                        key={i}
                        path={selected.dokumen?.[doc.key]}
                        label={doc.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>



            {/* Catatan verifikasi jika sudah diproses */}
            {selected.verifikasi?.catatan_verifikasi && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-red-600 mb-1">Catatan Penolakan:</p>
                <p className="text-sm text-red-700">{selected.verifikasi.catatan_verifikasi}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <p className="text-gray-400 text-sm">Pilih pendaftar dari daftar untuk melihat detail</p>
          </div>
        )}
      </div>

      {/* Modal Tolak */}
      {showTolakModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <h3 className="font-bold text-gray-800">Tolak Pendaftaran</h3>
              </div>
              <button onClick={() => setShowTolakModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Berikan catatan alasan penolakan untuk <strong>{selected?.nama}</strong>.
              Catatan ini akan dikirim ke email pendaftar.
            </p>

            <textarea value={catatanTolak} onChange={e => setCatatanTolak(e.target.value)}
              rows={4}
              placeholder="Contoh: Dokumen KTP tidak terbaca dengan jelas. Mohon upload ulang dengan kualitas yang lebih baik."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none mb-4" />

            <div className="flex gap-3">
              <button onClick={() => setShowTolakModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleTolak} disabled={submitting}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60">
                {submitting ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}