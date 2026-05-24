import { useState, useEffect } from 'react'
import { Download, Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import api from '../../lib/axios'

const DOKUMEN_LIST = [
  { key: 'data_identitas',   label: 'KTP / Identitas',      icon: '🪪', required: true  },
  { key: 'data_kualifikasi', label: 'Ijazah / Kualifikasi', icon: '📜', required: true  },
  { key: 'data_sertifikasi', label: 'Sertifikat Pendidik',  icon: '🏆', required: false },
]

const STATUS_DOK = {
  disetujui:          { cls: 'bg-emerald-100 text-emerald-700', label: 'Disetujui',            icon: CheckCircle  },
  pending:            { cls: 'bg-amber-100 text-amber-700',     label: 'Menunggu Verifikasi TU', icon: Clock        },
  ditolak:            { cls: 'bg-red-100 text-red-600',         label: 'Ditolak',               icon: XCircle      },
  tidak_ada:          { cls: 'bg-gray-100 text-gray-500',       label: 'Belum Diunggah',        icon: AlertCircle  },
}

export default function PendidikDokumen() {
  const [profil, setProfil]         = useState(null)
  const [perubahan, setPerubahan]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState({})
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')

  const fetchData = () => {
    Promise.all([
      api.get('/pendidik/profil'),
      api.get('/pendidik/perubahan'),
    ]).then(([profilRes, perubahanRes]) => {
      setProfil(profilRes.data.data)
      setPerubahan(perubahanRes.data.data?.filter(p => p.tipe === 'dokumen') || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleUploadDokumen = async (tipe, file) => {
    if (!file) return
    setUploading(u => ({ ...u, [tipe]: true }))
    setSuccess('')
    setError('')
    try {
      const fd = new FormData()
      fd.append('tipe_dokumen', tipe)
      fd.append('file', file)
      await api.post('/pendidik/perubahan/dokumen', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Request update dokumen berhasil diajukan, menunggu verifikasi admin')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan update dokumen')
    } finally {
      setUploading(u => ({ ...u, [tipe]: false }))
    }
  }

  const getPendingForDok = (tipe) =>
    perubahan.find(p => p.status === 'pending' && p.data_baru?.[tipe])

  const dokumen = profil?.dokumen

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Memuat dokumen...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Pendidik / Manajemen Dokumen</p>
          <h1 className="text-2xl font-bold text-[#054a5c]">Manajemen Dokumen Pendidik</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola dan perbarui berkas administrasi Anda untuk keperluan verifikasi berkala.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
          ${profil?.status_akun === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          <CheckCircle size={15} />
          STATUS AKUN: {profil?.status_akun === 'aktif' ? 'Terverifikasi Aktif' : 'Pending'}
        </div>
      </div>

      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">{success}</div>}
      {error   && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="grid grid-cols-3 gap-5">
        {/* Daftar Dokumen */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-[#054a5c]">Daftar Dokumen Utama</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Menunggu Verifikasi</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Disetujui</span>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[#054a5c] font-bold uppercase bg-gray-50">
                <th className="text-left px-5 py-3">Nama Dokumen</th>
                <th className="text-left px-5 py-3">Jenis Berkas</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DOKUMEN_LIST.map(doc => {
                const ada      = !!dokumen?.[doc.key]
                const pending  = getPendingForDok(doc.key)
                const statusKey = pending ? 'pending' : ada ? 'disetujui' : 'tidak_ada'
                const status   = STATUS_DOK[statusKey]
                const Icon     = status.icon
                return (
                  <tr key={doc.key} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{doc.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {doc.label}
                            {!doc.required && <span className="text-xs text-gray-400 font-normal ml-1">(opsional)</span>}
                          </p>
                          {pending && (
                            <p className="text-xs text-amber-600">Update sedang menunggu verifikasi</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">PDF / Image</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${status.cls}`}>
                        <Icon size={11} /> {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {ada && (
                          <a href={`http://localhost:8000/storage/${dokumen[doc.key]}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                            <Download size={12} /> Unduh
                          </a>
                        )}
                        {!pending && (
                          <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer
                            ${uploading[doc.key] ? 'bg-gray-100 text-gray-400' : 'bg-[#054a5c] text-white hover:bg-[#033a47]'}`}>
                            {uploading[doc.key] ? (
                              <><div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload size={12} /> Update Dokumen</>
                            )}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                              disabled={uploading[doc.key]}
                              onChange={e => handleUploadDokumen(doc.key, e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info Penting */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-[#054a5c] text-sm mb-3">Informasi Penting</h3>
            <div className="space-y-2.5">
              {[
                'Pastikan dokumen hasil pindaian (scan) terlihat jelas dan tidak terpotong.',
                'Format file yang didukung adalah PDF, JPG, dan PNG dengan ukuran maksimal 5MB.',
                'Dokumen yang ditolak biasanya disebabkan oleh masa berlaku yang habis atau kualitas gambar buruk.',
              ].map((info, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {info}
                </div>
              ))}
              <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mt-2">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                Update dokumen akan memicu proses verifikasi ulang oleh Tata Usaha.
              </div>
            </div>
          </div>

          {/* Unggah Cepat */}
          <div className="bg-[#054a5c] rounded-2xl p-5 text-center text-white">
            <Upload size={28} className="mx-auto mb-3 opacity-70" />
            <h3 className="font-bold mb-1">Unggah Cepat</h3>
            <p className="text-xs text-white/60 mb-4">Seret dan lepas file di sini untuk memulai pengunggahan otomatis.</p>
            <label className="bg-white text-[#054a5c] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100">
              PILIH FILE
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => {
                  const file = e.target.files[0]
                  if (file) handleUploadDokumen('data_kualifikasi', file)
                }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}