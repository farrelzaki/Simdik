import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Trash2, ChevronRight } from 'lucide-react'
import api from '../../lib/axios'

export default function HapusAkunRequest() {
  const [list, setList]             = useState([])
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [catatanTolak, setCatatanTolak] = useState('')
  const [showTolakModal, setShowTolakModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('pending')

  const fetchList = () => {
    setLoading(true)
    // Gunakan endpoint perubahan profil yang sudah ada, filter tipe
    api.get('/admin/hapus-akun-request', { params: { status: statusFilter } })
      .then(res => {
        setList(res.data.data || [])
        if (res.data.data?.length > 0) setSelected(res.data.data[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [statusFilter])

  const handleReview = async (status) => {
    if (!selected) return
    setSubmitting(true)
    try {
      await api.patch(`/admin/hapus-akun-request/${selected.id_request}`, {
        status, catatan: status === 'ditolak' ? catatanTolak : '',
      })
      fetchList()
      setSelected(null)
      setCatatanTolak('')
      setShowTolakModal(false)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const initials = (nama) => nama?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '??'

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 mb-1">Dashboard › Hapus Akun Request</p>
        <h1 className="text-2xl font-bold text-gray-800">Request Penghapusan Akun</h1>
        <p className="text-sm text-gray-400 mt-1">Tinjau dan proses permintaan penghapusan akun dari pendidik.</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* List */}
        <div className="w-72 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Daftar Request</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{list.length}</span>
            </div>
            <div className="flex gap-1">
              {['pending','disetujui','ditolak'].map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setSelected(null) }}
                  className={`flex-1 py-1 text-xs rounded-lg capitalize font-medium transition-all
                    ${statusFilter === s ? 'bg-[#1a4a6b] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <p className="text-center text-sm text-gray-400 py-8">Memuat...</p>
            ) : list.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">Tidak ada request</p>
            ) : list.map(item => (
              <button key={item.id_request}
                onClick={() => { setSelected(item); setCatatanTolak('') }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors
                  ${selected?.id_request === item.id_request ? 'bg-[#1a4a6b]/5 border-l-2 border-[#1a4a6b]' : 'hover:bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
                  {initials(item.pendidik?.nama)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.pendidik?.nama}</p>
                  <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 space-y-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-xl font-bold">
                    {initials(selected.pendidik?.nama)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selected.pendidik?.nama}</h2>
                    <p className="text-sm text-gray-400">{selected.pendidik?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">NIK: {selected.pendidik?.nik}</p>
                  </div>
                </div>
                {selected.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => { setShowTolakModal(true); setCatatanTolak('') }} disabled={submitting}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-40">
                      <XCircle size={15} /> Tolak
                    </button>
                    <button onClick={() => handleReview('disetujui')} disabled={submitting}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-40">
                      <Trash2 size={15} /> Setujui & Hapus Akun
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Alasan Penghapusan</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                {selected.alasan || 'Tidak ada alasan yang diberikan'}
              </p>
            </div>


          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <p className="text-gray-400 text-sm">Pilih request dari daftar</p>
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
                  <XCircle size={18} className="text-red-500" />
                </div>
                <h3 className="font-bold text-gray-800">Tolak Permintaan</h3>
              </div>
              <button onClick={() => setShowTolakModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Berikan catatan alasan penolakan untuk <strong>{selected?.pendidik?.nama}</strong>.
              Catatan ini akan dikirim ke pendidik.
            </p>

            <textarea value={catatanTolak} onChange={e => setCatatanTolak(e.target.value)}
              rows={4}
              placeholder="Contoh: Permintaan tidak dapat diproses saat ini karena data masih terikat dengan..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none mb-4" />

            <div className="flex gap-3">
              <button onClick={() => setShowTolakModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                Batal
              </button>
              <button onClick={() => handleReview('ditolak')} disabled={submitting}
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