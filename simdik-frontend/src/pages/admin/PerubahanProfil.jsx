import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, ChevronRight, X, User, FileText, Download } from 'lucide-react'
import api from '../../lib/axios'
import { downloadFile, previewFile, isImage } from '../../lib/fileHelper'

const STATUS_BADGE = {
  pending:   { cls: 'bg-amber-100 text-amber-700',    label: 'Pending'    },
  disetujui: { cls: 'bg-emerald-100 text-emerald-700', label: 'Disetujui' },
  ditolak:   { cls: 'bg-red-100 text-red-600',         label: 'Ditolak'   },
}

const FIELD_LABELS = {
  nama: 'Nama Lengkap', no_hp: 'No. HP', alamat: 'Alamat',
  pendidikan_terakhir: 'Pendidikan Terakhir', jabatan: 'Jabatan',
  unit_kerja: 'Unit Kerja', tempat_lahir: 'Tempat Lahir',
  tanggal_lahir: 'Tanggal Lahir', jenis_kelamin: 'Jenis Kelamin',
  data_identitas: 'KTP / Identitas', data_kualifikasi: 'Ijazah',
  data_sertifikasi: 'Sertifikasi',
}

export default function PerubahanProfil() {
  const [list, setList]             = useState([])
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [catatan, setCatatan]       = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')

  const fetchList = () => {
    setLoading(true)
    api.get('/admin/perubahan-profil', { params: { status: statusFilter } })
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

  const handleReview = async (status) => {
    if (!selected) return
    setSubmitting(true)
    try {
      await api.patch(`/admin/perubahan-profil/${selected.id_perubahan}`, {
        status, catatan,
      })
      fetchList()
      setSelected(null)
      setCatatan('')
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const initials = (nama) => nama?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 mb-1">Dashboard › Data Pendidik/Tendik › Review Perubahan</p>
        <h1 className="text-2xl font-bold text-gray-800">Review Perubahan Profil & Dokumen</h1>
        <p className="text-sm text-gray-400 mt-1">Tinjau dan setujui permintaan perubahan data dari pendidik.</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Left List */}
        <div className="w-72 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Request Masuk</h3>
              <span className="bg-[#1a4a6b] text-white text-xs px-2 py-0.5 rounded-full">
                {list.length}
              </span>
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
              <button key={item.id_perubahan}
                onClick={() => { setSelected(item); setCatatan('') }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors
                  ${selected?.id_perubahan === item.id_perubahan
                    ? 'bg-[#1a4a6b]/5 border-l-2 border-[#1a4a6b]'
                    : 'hover:bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-full bg-[#1a4a6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials(item.pendidik?.nama)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.pendidik?.nama}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize
                      ${item.tipe === 'profil' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {item.tipe}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Detail */}
        {selected ? (
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#1a4a6b] flex items-center justify-center text-white text-lg font-bold">
                    {initials(selected.pendidik?.nama)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selected.pendidik?.nama}</h2>
                    <p className="text-sm text-gray-400">{selected.pendidik?.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase
                        ${STATUS_BADGE[selected.status]?.cls}`}>
                        {STATUS_BADGE[selected.status]?.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize
                        ${selected.tipe === 'profil' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        Perubahan {selected.tipe}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(selected.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                {selected.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleReview('ditolak')} disabled={submitting}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-40">
                      <XCircle size={15} /> Tolak
                    </button>
                    <button onClick={() => handleReview('disetujui')} disabled={submitting}
                      className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-40">
                      <CheckCircle size={15} /> Setujui
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Perbandingan Data */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {selected.tipe === 'profil' ? <User size={16} /> : <FileText size={16} />}
                Detail Perubahan
              </h3>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      <th className="text-left px-4 py-3">Field</th>
                      <th className="text-left px-4 py-3">Data Lama</th>
                      <th className="text-left px-4 py-3">Data Baru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(selected.data_baru || {}).map(([key, newVal]) => (
                      <tr key={key}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          {FIELD_LABELS[key] || key}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {selected.tipe === 'dokumen' && selected.data_lama?.[key] ? (
                            <button onClick={() => downloadFile(selected.data_lama[key], `${FIELD_LABELS[key] || key}_lama`)}
                              className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs hover:bg-gray-200">
                              <Download size={11} /> Unduh file lama
                            </button>
                          ) : (
                            <span className="line-through">{selected.data_lama?.[key] || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-emerald-700 font-medium">
                          {selected.tipe === 'dokumen' ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">
                                File baru diunggah
                              </span>
                              <button onClick={() => downloadFile(newVal, FIELD_LABELS[key] || key)}
                                className="inline-flex items-center gap-1 bg-[#1a4a6b] text-white px-2.5 py-1 rounded text-xs hover:bg-[#15395a]">
                                <Download size={11} /> Unduh
                              </button>
                            </div>
                          ) : newVal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan */}
            {selected.status === 'pending' && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <FileText size={16} /> Catatan (opsional)
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  Catatan akan dikirim ke pendidik jika request ditolak.
                </p>
                <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
                  rows={3} placeholder="Tulis alasan penolakan atau catatan tambahan..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20 resize-none" />
              </div>
            )}

            {/* Catatan sebelumnya jika sudah diproses */}
            {selected.status !== 'pending' && selected.catatan && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h4 className="font-semibold text-gray-800 mb-2">Catatan Review</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{selected.catatan}</p>
                {selected.tata_usaha && (
                  <p className="text-xs text-gray-400 mt-2">
                    Direview oleh: {selected.tata_usaha.nama} • {new Date(selected.tanggal_review).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <p className="text-gray-400 text-sm">Pilih request dari daftar untuk melihat detail</p>
          </div>
        )}
      </div>
    </div>
  )
}