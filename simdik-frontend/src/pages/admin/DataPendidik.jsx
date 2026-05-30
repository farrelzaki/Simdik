import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter, Download, MoreVertical, Search, Eye, Pencil, Trash2, X, User, GraduationCap, FileText } from 'lucide-react'
import api from '../../lib/axios'
import { downloadFile, previewFile, isImage } from '../../lib/fileHelper'

function DokumenPreview({ path, label }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    if (!path) return
    setLoadingPreview(true)
    previewFile(path, setPreviewUrl).finally(() => setLoadingPreview(false))
  }, [path])

  return (
    <div className="border border-gray-200 bg-white shadow-sm rounded-xl p-4">
      <div className="aspect-video bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
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

const STATUS_COLORS = {
  aktif:    { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'VERIFIED'   },
  pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'PENDING'    },
  ditolak:  { bg: 'bg-red-100',     text: 'text-red-700',     label: 'DITOLAK'    },
}

export default function DataPendidik() {
  const navigate = useNavigate()
  const [data, setData]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [unitFilter, setUnitFilter] = useState('Semua')
  const [page, setPage]           = useState(1)
  const [meta, setMeta]           = useState({})
  const [showFilterLanjutan, setShowFilterLanjutan] = useState(false)
  const [statusKepegawaianFilter, setStatusKepegawaianFilter] = useState('')
  const [pendidikanTerakhirFilter, setPendidikanTerakhirFilter] = useState('')
  const [selected, setSelected]   = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [activeTab, setActiveTab] = useState('identitas')
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  const units = ['Semua', 'Unit SD', 'Unit SMP', 'Unit SMA', 'Unit SMK', 'Yayasan/Pusat']

  const fetchData = () => {
    setLoading(true)
    const params = { page, search }
    if (unitFilter !== 'Semua') params.unit_kerja = unitFilter
    if (statusKepegawaianFilter) params.status_kepegawaian = statusKepegawaianFilter
    if (pendidikanTerakhirFilter) params.pendidikan_terakhir = pendidikanTerakhirFilter
    api.get('/admin/pendidik', { params })
      .then(res => {
        setData(res.data.data)
        setMeta(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [page, unitFilter, statusKepegawaianFilter, pendidikanTerakhirFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/pendidik/${selected.id_pendidik}`)
      setShowDelete(false)
      setSelected(null)
      fetchData()
    } catch {
    } finally {
      setDeleting(false)
    }
  }

  const initials = (nama) => nama?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleExportCSV = () => {
    if (!data || data.length === 0) return alert('Tidak ada data untuk diexport')
    const headers = ['NIK', 'Nama Lengkap', 'Email', 'Unit Kerja', 'Jabatan', 'Status Pegawai']
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n'
      + data.map(row => 
          [row.nik, `"${row.nama}"`, row.email, row.unit_kerja || '-', row.jabatan || '-', row.status_kepegawaian].join(',')
        ).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "data_pendidik.csv")
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Dashboard &rsaquo; Data Pendidik/Tendik</p>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Data Pendidik & Tendik</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola data guru, staf administrasi, dan tenaga kependidikan lainnya.</p>
        </div>
        <button
          onClick={() => navigate('/admin/pendidik/tambah')}
          className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a]"
        >
          <Plus size={16} />
          Tambah Data Baru
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Filter Tabs + Search */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          {/* Unit Tabs */}
          <div className="flex gap-1 flex-wrap">
            {units.map(u => (
              <button
                key={u}
                onClick={() => { setUnitFilter(u); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${unitFilter === u
                    ? 'bg-[#1a4a6b] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Search + Export */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, NIK, email..."
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20"
              />
            </form>
            <div className="relative">
              <button 
                onClick={() => setShowFilterLanjutan(!showFilterLanjutan)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors ${
                  statusKepegawaianFilter || pendidikanTerakhirFilter 
                  ? 'border-[#1a4a6b] text-[#1a4a6b] bg-[#1a4a6b]/5' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                <Filter size={14} />
                Filter Lanjutan
                {(statusKepegawaianFilter || pendidikanTerakhirFilter) && (
                  <span className="w-2 h-2 rounded-full bg-[#1a4a6b] ml-1"></span>
                )}
              </button>

              {showFilterLanjutan && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 shadow-xl rounded-xl p-4 z-20">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Filter Lanjutan</h3>
                    {(statusKepegawaianFilter || pendidikanTerakhirFilter) && (
                      <button onClick={() => {
                        setStatusKepegawaianFilter('')
                        setPendidikanTerakhirFilter('')
                        setPage(1)
                      }} className="text-xs text-red-500 hover:underline">Reset</button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Status Kepegawaian</label>
                      <select 
                        value={statusKepegawaianFilter} 
                        onChange={e => { setStatusKepegawaianFilter(e.target.value); setPage(1) }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20">
                        <option value="">Semua Status</option>
                        <option value="PNS">PNS</option>
                        <option value="PPPK">PPPK</option>
                        <option value="Honorer">Honorer</option>
                        <option value="GTT">GTT</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Pendidikan Terakhir</label>
                      <select 
                        value={pendidikanTerakhirFilter} 
                        onChange={e => { setPendidikanTerakhirFilter(e.target.value); setPage(1) }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20">
                        <option value="">Semua Pendidikan</option>
                        <option value="SMA/SMK Sederajat">SMA/SMK Sederajat</option>
                        <option value="D3">D3</option>
                        <option value="D4">D4</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium">NIK</th>
              <th className="text-left px-5 py-3 font-medium">Nama Lengkap</th>
              <th className="text-left px-5 py-3 font-medium">Unit Tujuan</th>
              <th className="text-left px-5 py-3 font-medium">Posisi</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Memuat data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Tidak ada data</td></tr>
            ) : data.map((row) => {
              const status = STATUS_COLORS[row.status_akun] || STATUS_COLORS.pending
              return (
                <tr key={row.id_pendidik} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-600">{row.nik}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1a4a6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials(row.nama)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{row.nama}</p>
                        <p className="text-xs text-gray-400">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{row.unit_kerja || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{row.jabatan || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelected(row); setActiveTab('identitas'); setShowDetail(true) }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                        title="Lihat Detail"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/pendidik/${row.id_pendidik}/edit`)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { setSelected(row); setShowDelete(true) }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Menampilkan {meta.from}–{meta.to} dari {meta.total} entri
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${page === p ? 'bg-[#1a4a6b] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {showDetail && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header Profil */}
            <div className="bg-[#1a4a6b] p-6 relative flex-shrink-0">
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                  {initials(selected.nama)}
                </div>
                <div>
                  <h3 className="text-white font-bold text-2xl tracking-tight">{selected.nama}</h3>
                  <p className="text-white/80 text-sm mt-1">{selected.email} • {selected.no_hp || 'No HP belum diisi'}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="bg-white/15 border border-white/20 text-white text-xs px-3 py-1 rounded-full font-medium tracking-wide">
                      {selected.status_kepegawaian}
                    </span>
                    <span className="bg-white/15 border border-white/20 text-white text-xs px-3 py-1 rounded-full font-medium tracking-wide">
                      {selected.unit_kerja || 'Unit Kerja Belum Diatur'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 flex-shrink-0 bg-white">
              {[
                { id: 'identitas', label: 'Identitas Diri', icon: User },
                { id: 'kualifikasi', label: 'Kualifikasi & Jabatan', icon: GraduationCap },
                { id: 'berkas', label: 'Dokumen', icon: FileText },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2
                    ${activeTab === tab.id ? 'border-[#1a4a6b] text-[#1a4a6b]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
              
              {/* TAB: IDENTITAS */}
              {activeTab === 'identitas' && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'NIK', value: selected.nik },
                    { label: 'Nama Lengkap', value: selected.nama },
                    { label: 'Email', value: selected.email },
                    { label: 'No. HP', value: selected.no_hp },
                    { label: 'Tempat Lahir', value: selected.tempat_lahir },
                    {
                      label: 'Tanggal Lahir', value: selected.tanggal_lahir
                        ? new Date(selected.tanggal_lahir).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})
                        : '—'
                    },
                    { label: 'Jenis Kelamin', value: selected.jenis_kelamin },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">{item.label}</p>
                      <p className="text-sm text-gray-800 font-medium">{item.value || '—'}</p>
                    </div>
                  ))}
                  <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Alamat Lengkap</p>
                    <p className="text-sm text-gray-800 font-medium">{selected.alamat || '—'}</p>
                  </div>
                </div>
              )}

              {/* TAB: KUALIFIKASI */}
              {activeTab === 'kualifikasi' && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Unit Kerja', value: selected.unit_kerja },
                    { label: 'Jabatan', value: selected.jabatan },
                    { label: 'Status Kepegawaian', value: selected.status_kepegawaian },
                    { label: 'Pendidikan Terakhir', value: selected.pendidikan_terakhir },
                    { label: 'Bidang Ajar', value: selected.bidang_ajar },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">{item.label}</p>
                      <p className="text-sm text-gray-800 font-medium">{item.value || '—'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: BERKAS */}
              {activeTab === 'berkas' && (
                <div className="grid grid-cols-2 gap-5">
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

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-white">
              <button
                onClick={() => setShowDetail(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => { setShowDetail(false); navigate(`/admin/pendidik/${selected.id_pendidik}/edit`) }}
                className="px-6 py-2.5 bg-[#1a4a6b] text-white rounded-xl text-sm font-medium hover:bg-[#15395a] flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#1a4a6b]/20"
              >
                <Pencil size={16} /> Edit Data Pendidik
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-center font-bold text-gray-800 mb-2">Hapus Data?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              Data <strong>{selected.nama}</strong> akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}