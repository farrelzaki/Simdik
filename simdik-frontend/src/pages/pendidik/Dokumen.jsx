import { useState, useEffect, useCallback, useRef } from 'react'
import { Download, Upload, CheckCircle, Clock, XCircle, AlertCircle, Plus, RefreshCw, FileText, Eye } from 'lucide-react'
import api from '../../lib/axios'
import { downloadFile } from '../../lib/fileHelper'

// ─── Tipe dokumen utama (bukan sertifikasi)
const DOKUMEN_UTAMA = [
  { key: 'data_identitas', label: 'KTP / Identitas', icon: '🪪', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'data_kualifikasi', label: 'Ijazah / Kualifikasi', icon: '📜', accept: '.pdf,.jpg,.jpeg,.png' },
]

// ─── Helper: semua key sertifikasi dari objek dokumen
const getSertifikasiKeys = (dokumen) => {
  if (!dokumen) return []
  return Object.keys(dokumen).filter(k =>
    k === 'data_sertifikasi' || k.startsWith('sertifikasi_')
  ).filter(k => !!dokumen[k])
}

// ─── Status badge config
const STATUS_CFG = {
  disetujui: { cls: 'bg-emerald-100 text-emerald-700', label: 'Disetujui', Icon: CheckCircle },
  pending: { cls: 'bg-amber-100  text-amber-700', label: 'Menunggu Verif.', Icon: Clock },
  ditolak: { cls: 'bg-red-100    text-red-600', label: 'Ditolak', Icon: XCircle },
  tidak_ada: { cls: 'bg-gray-100   text-gray-500', label: 'Belum Diunggah', Icon: AlertCircle },
}

function StatusBadge({ statusKey }) {
  const cfg = STATUS_CFG[statusKey] || STATUS_CFG.tidak_ada
  const { Icon, cls, label } = cfg
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${cls}`}>
      <Icon size={11} /> {label}
    </span>
  )
}

export default function PendidikDokumen() {
  const [profil, setProfil] = useState(null)
  const [perubahan, setPerubahan] = useState([])   // hanya tipe=dokumen
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [uploading, setUploading] = useState({})   // { [key]: bool }
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Modal tambah sertifikasi baru
  const [showTambah, setShowTambah] = useState(false)
  const [fileBaru, setFileBaru] = useState(null)
  const [uploadingBaru, setUploadingBaru] = useState(false)

  const intervalRef = useRef(null)
  const prevStatusRef = useRef({})

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const [profilRes, perubahanRes] = await Promise.all([
        api.get('/pendidik/profil'),
        api.get('/pendidik/perubahan'),
      ])
      setProfil(profilRes.data.data)
      const docs = perubahanRes.data.data?.filter(p => p.tipe === 'dokumen') || []

      // Notif: ada yang baru disetujui
      docs.forEach(p => {
        if (prevStatusRef.current[p.id_perubahan] === 'pending' && p.status === 'disetujui') {
          setSuccess('Dokumen Anda telah disetujui oleh admin!')
        }
        prevStatusRef.current[p.id_perubahan] = p.status
      })
      setPerubahan(docs)
    } catch (e) {
      console.error('Gagal fetch dokumen:', e)
    } finally {
      setLoading(false)
      if (isManual) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(() => fetchData(), 5000)
    const onFocus = () => fetchData()
    const onVisible = () => { if (document.visibilityState === 'visible') fetchData() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(intervalRef.current)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchData])

  // ─── Upload helper ───────────────────────────────────────────────────────────
  const uploadDokumen = async (tipeDokumen, file) => {
    if (!file) return
    setUploading(u => ({ ...u, [tipeDokumen]: true }))
    setSuccess('')
    setError('')
    try {
      const fd = new FormData()
      fd.append('tipe_dokumen', tipeDokumen)
      fd.append('file', file)
      await api.post('/pendidik/perubahan/dokumen', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Permintaan berhasil diajukan, menunggu verifikasi admin.')
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan perubahan dokumen')
    } finally {
      setUploading(u => ({ ...u, [tipeDokumen]: false }))
    }
  }

  // ─── Tambah sertifikasi baru ─────────────────────────────────────────────────
  const handleTambahSertifikasi = async () => {
    if (!fileBaru) return
    setUploadingBaru(true)
    setSuccess('')
    setError('')
    try {
      // Key unik berdasarkan timestamp agar tidak override yang lama
      const key = `sertifikasi_${Date.now()}`
      const fd = new FormData()
      fd.append('tipe_dokumen', key)
      fd.append('file', fileBaru)
      await api.post('/pendidik/perubahan/dokumen', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Sertifikasi baru berhasil diajukan, menunggu verifikasi admin.')
      setShowTambah(false)
      setFileBaru(null)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan sertifikasi')
    } finally {
      setUploadingBaru(false)
    }
  }

  // ─── Helpers: cek status & path dokumen ─────────────────────────────────────
  const dokumen = profil?.dokumen || {}

  // Cari perubahan pending untuk key tertentu
  const getPending = (key) =>
    perubahan.find(p => p.status === 'pending' && p.data_baru?.[key])

  // Status efektif sebuah dokumen
  const getStatus = (key) => {
    if (getPending(key)) return 'pending'
    if (dokumen[key]) return 'disetujui'
    // Cek apakah ada perubahan disetujui (jika DB belum sync)
    if (perubahan.find(p => p.status === 'disetujui' && p.data_baru?.[key])) return 'disetujui'
    return 'tidak_ada'
  }

  // Path aktif dari dokumen atau fallback ke perubahan disetujui
  const getPath = (key) => {
    if (dokumen[key]) return dokumen[key]
    return perubahan.find(p => p.status === 'disetujui' && p.data_baru?.[key])?.data_baru?.[key] || null
  }

  // ─── Kumpulkan semua sertifikasi: aktif + pending ────────────────────────────
  const getSertifikasiList = () => {
    const items = []

    // 1. Sertifikasi aktif (sudah disetujui, ada di dokumen)
    const activeKeys = getSertifikasiKeys(dokumen)
    activeKeys.forEach(key => {
      items.push({
        id: key,
        path: dokumen[key],
        status: getPending(key) ? 'pending' : 'disetujui',
        label: key === 'data_sertifikasi' ? 'Sertifikasi' : `Sertifikasi ${key.replace('sertifikasi_', '#')}`,
        fromRegistrasi: key === 'data_sertifikasi',
      })
    })

    // 2. Sertifikasi pending yang belum masuk dokumen aktif
    const pendingKeys = perubahan
      .filter(p => p.status === 'pending')
      .flatMap(p => Object.keys(p.data_baru || {}).filter(k =>
        k === 'data_sertifikasi' || k.startsWith('sertifikasi_')
      ))
    pendingKeys.forEach(key => {
      if (!items.find(i => i.id === key)) {
        items.push({
          id: key,
          path: null,
          status: 'pending',
          label: key === 'data_sertifikasi' ? 'Sertifikasi' : `Sertifikasi Baru`,
          fromRegistrasi: false,
        })
      }
    })

    return items
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Memuat dokumen...</div>
  )

  const sertList = getSertifikasiList()

  return (
    <div className="space-y-5">

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Pendidik / Manajemen Dokumen</p>
          <h1 className="text-2xl font-bold text-[#054a5c]">Manajemen Dokumen</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola dan perbarui berkas administrasi Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Memperbarui...' : 'Perbarui Status'}
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            ${profil?.status_akun === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            <CheckCircle size={15} />
            {profil?.status_akun === 'aktif' ? 'Akun Aktif' : 'Pending'}
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={15} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">

          {/* ─── Dokumen Utama ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#054a5c]">Dokumen Utama</h3>
              <p className="text-xs text-gray-400 mt-0.5">KTP dan ijazah yang digunakan untuk verifikasi akun</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#054a5c] font-bold uppercase bg-gray-50">
                  <th className="text-left px-5 py-3">Dokumen</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DOKUMEN_UTAMA.map(doc => {
                  const statusKey = getStatus(doc.key)
                  const path = getPath(doc.key)
                  const isPending = statusKey === 'pending'

                  return (
                    <tr key={doc.key} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{doc.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
                            {isPending && (
                              <p className="text-xs text-amber-600 mt-0.5">Menunggu verifikasi admin</p>
                            )}
                            {statusKey === 'tidak_ada' && (
                              <p className="text-xs text-gray-400 mt-0.5">Belum diunggah</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge statusKey={statusKey} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {path && (
                            <button
                              onClick={() => downloadFile(path, doc.label)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                            >
                              <Download size={12} /> Unduh
                            </button>
                          )}
                          {!isPending && (
                            <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer
                              ${uploading[doc.key] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#054a5c] text-white hover:bg-[#033a47]'}`}>
                              {uploading[doc.key] ? (
                                <><div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                              ) : (
                                <><Upload size={12} /> {path ? 'Update' : 'Upload'}</>
                              )}
                              <input
                                type="file"
                                className="hidden"
                                accept={doc.accept}
                                disabled={uploading[doc.key]}
                                onChange={e => uploadDokumen(doc.key, e.target.files[0])}
                              />
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

          {/* ─── Sertifikasi ────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#054a5c]">Sertifikasi Profesional</h3>
                <p className="text-xs text-gray-400 mt-0.5">Anda dapat memiliki lebih dari satu sertifikasi</p>
              </div>
              <button
                onClick={() => { setShowTambah(true); setFileBaru(null) }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#054a5c] text-white rounded-lg text-xs font-medium hover:bg-[#033a47]"
              >
                <Plus size={13} /> Tambah Sertifikasi
              </button>
            </div>

            {/* Form Tambah */}
            {showTambah && (
              <div className="px-5 py-4 bg-[#054a5c]/5 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#054a5c] mb-3">Ajukan Sertifikasi Baru</p>
                <label className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${fileBaru ? 'border-[#054a5c] bg-white' : 'border-gray-300 hover:border-[#054a5c]/50 bg-white'}`}>
                  {fileBaru ? (
                    <><CheckCircle size={16} className="text-[#054a5c] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#054a5c]">{fileBaru.name}</p>
                        <p className="text-xs text-gray-400">Klik untuk ganti file</p>
                      </div></>
                  ) : (
                    <><Upload size={16} className="text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-400">Klik untuk pilih file (PDF/JPG/PNG, maks. 5MB)</p></>
                  )}
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFileBaru(e.target.files[0])} />
                </label>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setShowTambah(false); setFileBaru(null) }}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleTambahSertifikasi}
                    disabled={uploadingBaru || !fileBaru}
                    className="flex-1 bg-[#054a5c] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#033a47] disabled:opacity-60"
                  >
                    {uploadingBaru ? 'Mengajukan...' : 'Ajukan Sertifikasi'}
                  </button>
                </div>
              </div>
            )}

            {/* List Sertifikasi */}
            {sertList.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Belum ada sertifikasi.</p>
                <p className="text-xs text-gray-400 mt-1">Klik "Tambah Sertifikasi" untuk mengunggah.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-[#054a5c] font-bold uppercase bg-gray-50">
                    <th className="text-left px-5 py-3">Sertifikasi</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sertList.map(sert => {
                    const isPending = sert.status === 'pending'
                    return (
                      <tr key={sert.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🏆</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{sert.label}</p>
                              {sert.fromRegistrasi && (
                                <p className="text-xs text-gray-400 mt-0.5">Diunggah saat registrasi</p>
                              )}
                              {isPending && (
                                <p className="text-xs text-amber-600 mt-0.5">Menunggu verifikasi admin</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge statusKey={sert.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {sert.path && (
                              <button
                                onClick={() => downloadFile(sert.path, sert.label)}
                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                              >
                                <Download size={12} /> Unduh
                              </button>
                            )}
                            {!isPending && sert.status === 'disetujui' && (
                              <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer
                                ${uploading[sert.id] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#054a5c] text-white hover:bg-[#033a47]'}`}>
                                {uploading[sert.id] ? (
                                  <><div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                ) : (
                                  <><Upload size={12} /> Update</>
                                )}
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  disabled={uploading[sert.id]}
                                  onChange={e => uploadDokumen(sert.id, e.target.files[0])}
                                />
                              </label>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ─── Sidebar Info ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-[#054a5c] text-sm mb-3">Informasi Penting</h3>
            <div className="space-y-2.5">
              {[
                'Dokumen hasil scan harus terlihat jelas dan tidak terpotong.',
                'Format file: PDF, JPG, PNG. Ukuran maksimal 5MB.',
                'Dokumen yang ditolak biasanya karena kualitas buruk atau tidak terbaca.',
              ].map((info, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {info}
                </div>
              ))}
              <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mt-2">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                Setiap perubahan dokumen memerlukan verifikasi ulang oleh Tata Usaha.
              </div>
            </div>
          </div>

          {/* Ringkasan Status */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-[#054a5c] text-sm mb-3">Ringkasan Dokumen</h3>
            <div className="space-y-2">
              {[...DOKUMEN_UTAMA, ...sertList.map(s => ({ key: s.id, label: s.label, icon: '🏆' }))].map(doc => {
                const statusKey = 'icon' in doc && doc.icon === '🏆'
                  ? (sertList.find(s => s.id === doc.key)?.status || 'tidak_ada')
                  : getStatus(doc.key)
                const cfg = STATUS_CFG[statusKey] || STATUS_CFG.tidak_ada
                return (
                  <div key={doc.key} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-600">{doc.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}