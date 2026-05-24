import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter, Download, MoreVertical, Search, Eye, Pencil, Trash2, X } from 'lucide-react'
import api from '../../lib/axios'

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
  const [selected, setSelected]   = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  const units = ['Semua', 'Unit SD', 'Unit SMP', 'Unit SMA', 'Unit SMK', 'Yayasan/Pusat']

  const fetchData = () => {
    setLoading(true)
    const params = { page, search }
    if (unitFilter !== 'Semua') params.unit_kerja = unitFilter
    api.get('/admin/pendidik', { params })
      .then(res => {
        setData(res.data.data)
        setMeta(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [page, unitFilter])

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
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter size={14} />
              Filter Lanjutan
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
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
                        onClick={() => { setSelected(row); setShowDetail(true) }}
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="bg-[#1a4a6b] p-6 relative">
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                  {initials(selected.nama)}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.nama}</h3>
                  <p className="text-white/60 text-sm">{selected.jabatan || 'Pendidik'}</p>
                  <span className="mt-1 inline-block bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    STAFF
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Nomor Induk Kepegawaian (NIK)', value: selected.nik, icon: '🪪' },
                { label: 'Unit Kerja', value: selected.unit_kerja || '—', icon: '🏫' },
                { label: 'Jabatan', value: selected.jabatan || '—', icon: '💼' },
                { label: 'Status Pegawai', value: selected.status_kepegawaian, icon: '✅' },
                { label: 'Email Address', value: selected.email, icon: '✉️' },
                { label: 'Phone Number', value: selected.no_hp || '—', icon: '📞' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-sm text-gray-700 font-medium">{item.icon} {item.value}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowDetail(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => { setShowDetail(false); navigate(`/admin/pendidik/${selected.id_pendidik}/edit`) }}
                className="flex-1 bg-[#1a4a6b] text-white py-2.5 rounded-xl text-sm hover:bg-[#15395a] flex items-center justify-center gap-2"
              >
                <Pencil size={14} /> Edit Profile
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