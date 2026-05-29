import { useState, useEffect } from 'react'
import { Download, Upload, CheckCircle, Clock, XCircle, AlertCircle, Plus } from 'lucide-react'
import api from '../../lib/axios'
import { downloadFile } from '../../lib/fileHelper'

const DOKUMEN_UTAMA = [
  { key: 'data_identitas',   label: 'KTP / Identitas',      icon: '🪪', required: true  },
  { key: 'data_kualifikasi', label: 'Ijazah / Kualifikasi', icon: '📜', required: true  },
]

const STATUS_DOK = {
  disetujui:  { cls: 'bg-emerald-100 text-emerald-700', label: 'Disetujui',              icon: CheckCircle  },
  pending:    { cls: 'bg-amber-100 text-amber-700',     label: 'Menunggu Verifikasi TU', icon: Clock        },
  ditolak:    { cls: 'bg-red-100 text-red-600',         label: 'Ditolak',                icon: XCircle      },
  tidak_ada:  { cls: 'bg-gray-100 text-gray-500',       label: 'Belum Diunggah',         icon: AlertCircle  },
}

export default function PendidikDokumen() {
  const [profil, setProfil]           = useState(null)
  const [perubahan, setPerubahan]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [uploading, setUploading]     = useState({})
  const [success, setSuccess]         = useState('')
  const [error, setError]             = useState('')

  // State untuk sertifikasi tambahan
  const [sertifikasi, setSertifikasi] = useState([])
  const [showTambahSert, setShowTambahSert] = useState(false)
  const [namaSert, setNamaSert]       = useState('')
  const [fileSert, setFileSert]       = useState(null)
  const [uploadingSert, setUploadingSert] = useState(false)

  const fetchData = () => {
    Promise.all([
      api.get('/pendidik/profil'),
      api.get('/pendidik/perubahan'),
    ]).then(([profilRes, perubahanRes]) => {
      setProfil(profilRes.data.data)
      const perubahanDokumen = perubahanRes.data.data?.filter(p => p.tipe === 'dokumen') || []
      setPerubahan(perubahanDokumen)
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

  const handleTambahSertifikasi = async () => {
    if (!fileSert) return
    setUploadingSert(true)
    try {
      const fd = new FormData()
      fd.append('tipe_dokumen', 'data_sertifikasi')
      fd.append('file', fileSert)
      await api.post('/pendidik/perubahan/dokumen', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Sertifikasi berhasil diajukan, menunggu verifikasi admin')
      setShowTambahSert(false)
      setNamaSert('')
      setFileSert(null)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah sertifikasi')
    } finally {
      setUploadingSert(false)
    }
  }

  const getPendingForDok = (tipe) =>
    perubahan.find(p => p.status === 'pending' && p.data_baru?.[tipe])

  const dokumen = profil?.dokumen

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Memuat dokumen...</div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Pendidik / Manajemen Dokumen</p>
          <h1 className="text-2xl font-bold text-[#054a5c]">Manajemen Dokumen Pendidik</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola dan perbarui berkas administrasi Anda.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
          ${profil?.status_akun === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          <CheckCircle size={15} />
          {profil?.status_akun === 'aktif' ? 'Terverifikasi Aktif' : 'Pending'}
        </div>
      </div>

      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">{success}</div>}
      {error   && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          {/* Dokumen Utama */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#054a5c]">Dokumen Utama</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Menunggu</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Disetujui</span>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#054a5c] font-bold uppercase bg-gray-50">
                  <th className="text-left px-5 py-3">Nama Dokumen</th>
                  <th className="text-left px-5 py-3">Jenis</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DOKUMEN_UTAMA.map(doc => {
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
                            <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
                            {pending && <p className="text-xs text-amber-600">Update sedang menunggu verifikasi</p>}
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
                            <button onClick={() => downloadFile(dokumen[doc.key], doc.label)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                              <Download size={12} /> Unduh
                            </button>
                          )}
                          {!pending && (
                            <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer
                              ${uploading[doc.key] ? 'bg-gray-100 text-gray-400' : 'bg-[#054a5c] text-white hover:bg-[#033a47]'}`}>
                              {uploading[doc.key] ? (
                                <><div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                              ) : (
                                <><Upload size={12} /> Update</>
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

          {/* Sertifikasi */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#054a5c]">Sertifikasi Profesional</h3>
              <button onClick={() => setShowTambahSert(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#054a5c] text-white rounded-lg text-xs font-medium hover:bg-[#033a47]">
                <Plus size={13} /> Tambah Sertifikasi
              </button>
            </div>

            {/* Form Tambah Sertifikasi */}
            {showTambahSert && (
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Nama Sertifikasi</label>
                    <input value={namaSert} onChange={e => setNamaSert(e.target.value)}
                      placeholder="Contoh: Sertifikasi Pendidik (SERDOS)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#054a5c]/20" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">File Sertifikasi</label>
                    <label className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all
                      ${fileSert ? 'border-[#054a5c] bg-[#054a5c]/5' : 'border-gray-300 hover:border-[#054a5c]/40'}`}>
                      {fileSert ? (
                        <><CheckCircle size={15} className="text-[#054a5c]" /><span className="text-sm text-[#054a5c] font-medium">{fileSert.name}</span></>
                      ) : (
                        <><Upload size={15} className="text-gray-400" /><span className="text-sm text-gray-400">Klik untuk pilih file (PDF/JPG/PNG, max 5MB)</span></>
                      )}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => setFileSert(e.target.files[0])} />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowTambahSert(false); setNamaSert(''); setFileSert(null) }}
                      className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50">
                      Batal
                    </button>
                    <button onClick={handleTambahSertifikasi} disabled={uploadingSert || !fileSert}
                      className="flex-1 bg-[#054a5c] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#033a47] disabled:opacity-60">
                      {uploadingSert ? 'Mengajukan...' : 'Ajukan Sertifikasi'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List Sertifikasi */}
            <div className="divide-y divide-gray-50">
              {/* Sertifikasi aktif yang sudah disetujui */}
              {dokumen?.data_sertifikasi && (
                <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏆</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Sertifikasi</p>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle size={10} /> Disetujui
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => downloadFile(dokumen.data_sertifikasi, 'Sertifikasi')}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                      <Download size={12} /> Unduh
                    </button>
                    {!getPendingForDok('data_sertifikasi') && (
                      <label className="flex items-center gap-1 px-3 py-1.5 bg-[#054a5c] text-white rounded-lg text-xs cursor-pointer hover:bg-[#033a47]">
                        <Upload size={12} /> Update
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => handleUploadDokumen('data_sertifikasi', e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Hanya tampilkan SATU pending sertifikasi terbaru saja */}
              {(() => {
                const pendingSert = perubahan
                  .filter(p => p.data_baru?.data_sertifikasi && p.status === 'pending')
                  .slice(0, 1) // ambil hanya yang terbaru
                return pendingSert.map(p => (
                  <div key={p.id_perubahan} className="flex items-center justify-between px-5 py-4 bg-amber-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏆</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Sertifikasi Baru</p>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          <Clock size={10} /> Menunggu Verifikasi
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              })()}

              {/* Kalau tidak ada sertifikasi sama sekali */}
              {!dokumen?.data_sertifikasi && perubahan.filter(p => p.data_baru?.data_sertifikasi && p.status === 'pending').length === 0 && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  Belum ada sertifikasi. Klik "Tambah Sertifikasi" untuk mengunggah.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-[#054a5c] text-sm mb-3">Informasi Penting</h3>
            <div className="space-y-2.5">
              {[
                'Pastikan dokumen hasil pindaian terlihat jelas dan tidak terpotong.',
                'Format file: PDF, JPG, PNG. Ukuran maksimal 5MB.',
                'Dokumen yang ditolak biasanya karena kualitas gambar buruk atau masa berlaku habis.',
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

          <div className="bg-[#054a5c] rounded-2xl p-5 text-center text-white">
            <Upload size={28} className="mx-auto mb-3 opacity-70" />
            <h3 className="font-bold mb-1">Unggah Cepat</h3>
            <p className="text-xs text-white/60 mb-4">Upload dokumen identitas atau kualifikasi dengan cepat.</p>
            <label className="bg-white text-[#054a5c] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 inline-block">
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