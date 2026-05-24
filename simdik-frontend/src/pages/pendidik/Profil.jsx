import { useState, useEffect, useRef } from 'react'
import { Camera, Trash2, GraduationCap, Award, Clock, CheckCircle, XCircle, Send, X } from 'lucide-react'
import api from '../../lib/axios'

const FIELD_LABELS = {
  nama: 'Nama Lengkap', no_hp: 'No. HP', alamat: 'Alamat',
  pendidikan_terakhir: 'Pendidikan Terakhir', jabatan: 'Jabatan',
  unit_kerja: 'Unit Kerja', tempat_lahir: 'Tempat Lahir',
  tanggal_lahir: 'Tanggal Lahir', jenis_kelamin: 'Jenis Kelamin',
  bidang_ajar: 'Bidang Ajar',
}

const STATUS_BADGE = {
  pending:   { cls: 'bg-amber-100 text-amber-700',    label: 'Menunggu Review', icon: Clock        },
  disetujui: { cls: 'bg-emerald-100 text-emerald-700', label: 'Disetujui',      icon: CheckCircle  },
  ditolak:   { cls: 'bg-red-100 text-red-600',         label: 'Ditolak',        icon: XCircle      },
}

export default function PendidikProfil() {
  const [profil, setProfil]             = useState(null)
  const [perubahan, setPerubahan]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [success, setSuccess]           = useState('')
  const [error, setError]               = useState('')
  const [showFotoModal, setShowFotoModal] = useState(false)
  const [fotoPreview, setFotoPreview]   = useState(null)
  const [fotoFile, setFotoFile]         = useState(null)
  const [fotoLoading, setFotoLoading]   = useState(false)
  const fotoInputRef = useRef()

  const [form, setForm] = useState({
    nama: '', no_hp: '', alamat: '', pendidikan_terakhir: '',
    jabatan: '', unit_kerja: '', tempat_lahir: '',
    tanggal_lahir: '', jenis_kelamin: '', bidang_ajar: '',
  })

  const fetchData = () => {
    Promise.all([
      api.get('/pendidik/profil'),
      api.get('/pendidik/perubahan'),
    ]).then(([profilRes, perubahanRes]) => {
      const p = profilRes.data.data
      setProfil(p)
      setPerubahan(perubahanRes.data.data?.filter(x => x.tipe === 'profil') || [])
      setForm({
        nama:                p.nama || '',
        no_hp:               p.no_hp || '',
        alamat:              p.alamat || '',
        pendidikan_terakhir: p.pendidikan_terakhir || '',
        jabatan:             p.jabatan || '',
        unit_kerja:          p.unit_kerja || '',
        tempat_lahir:        p.tempat_lahir || '',
        tanggal_lahir:       p.tanggal_lahir
                              ? new Date(p.tanggal_lahir).toISOString().split('T')[0]
                              : '',
        jenis_kelamin:       p.jenis_kelamin || '',
        bidang_ajar:         p.bidang_ajar || '',
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const hasPending = perubahan.some(p => p.status === 'pending')

  const handleAjukan = async (e) => {
    e.preventDefault()
    if (hasPending) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/pendidik/perubahan/profil', form)
      setSuccess('Request perubahan berhasil diajukan, menunggu verifikasi admin')
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan perubahan')
    } finally {
      setSaving(false)
    }
  }

  // Foto handlers
  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const handleUploadFoto = async () => {
    if (!fotoFile) return
    setFotoLoading(true)
    try {
      const fd = new FormData()
      fd.append('foto', fotoFile)
      const res = await api.post('/pendidik/foto-profil', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfil(p => ({ ...p, foto_url: res.data.foto_url }))
      setSuccess('Foto profil berhasil diperbarui')
      setShowFotoModal(false)
      setFotoFile(null)
      setFotoPreview(null)
    } catch {
      setError('Gagal upload foto')
    } finally {
      setFotoLoading(false)
    }
  }

  const handleHapusFoto = async () => {
    setFotoLoading(true)
    try {
      await api.delete('/pendidik/foto-profil')
      setProfil(p => ({ ...p, foto_profil: null, foto_url: null }))
      setSuccess('Foto profil berhasil dihapus')
      setShowFotoModal(false)
    } catch {
      setError('Gagal menghapus foto')
    } finally {
      setFotoLoading(false)
    }
  }

  const initials = (nama) => nama?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PD'
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#054a5c]/20 bg-white"

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Memuat profil...</div>
  )

  return (
    <div className="max-w-4xl space-y-5">
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">{success}</div>}
      {error   && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#054a5c] to-[#0e7d71] h-24" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            {/* Avatar — klik untuk buka modal foto */}
            <div className="relative group cursor-pointer" onClick={() => showForm && setShowFotoModal(true)}>
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-[#054a5c] flex items-center justify-center">
                {profil?.foto_url ? (
                  <img src={profil.foto_url} alt="foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{initials(profil?.nama)}</span>
                )}
              </div>
              {showForm && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center">
                    <Camera size={18} className="text-white mx-auto" />
                    <p className="text-white text-[10px] mt-1">Update Foto</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-12">
              {!showForm ? (
                <button onClick={() => { setShowForm(true); setSuccess(''); setError('') }}
                  disabled={hasPending}
                  title={hasPending ? 'Ada request pending yang belum diproses' : ''}
                  className="flex items-center gap-2 px-4 py-2 bg-[#054a5c] text-white rounded-xl text-sm font-medium hover:bg-[#033a47] disabled:opacity-50 disabled:cursor-not-allowed">
                  Edit Profil
                </button>
              ) : (
                <button onClick={() => { setShowForm(false); setError('') }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                  <X size={14} /> Batal Edit
                </button>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#054a5c]">{profil?.nama}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {profil?.jabatan || 'Pendidik'}
            {profil?.bidang_ajar ? ` • ${profil.bidang_ajar}` : ''}
            {profil?.unit_kerja ? ` • ${profil.unit_kerja}` : ''}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium
              ${profil?.status_akun === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {profil?.status_akun === 'aktif' ? '✅ Terverifikasi' : '⏳ Pending'}
            </span>
            {hasPending && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700">
                ⏳ Ada request perubahan pending
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Kiri — Data */}
        <div className="col-span-2 space-y-4">
          {/* Data Diri */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#054a5c] rounded-lg flex items-center justify-center text-white text-sm">👤</div>
                <h3 className="font-bold text-[#054a5c]">Data Diri Lengkap</h3>
              </div>
              {profil?.updated_at && (
                <span className="text-xs text-[#054a5c] font-medium">
                  Update Terakhir: {new Date(profil.updated_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                </span>
              )}
            </div>

            {!showForm ? (
              // VIEW MODE
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'NIK',                 value: profil?.nik               },
                  { label: 'Email',               value: profil?.email             },
                  { label: 'No. HP',              value: profil?.no_hp             },
                  { label: 'Tempat, Tgl Lahir',   value: profil?.tempat_lahir
                    ? `${profil.tempat_lahir}, ${profil.tanggal_lahir ? new Date(profil.tanggal_lahir).toLocaleDateString('id-ID') : ''}`
                    : '—' },
                  { label: 'Jenis Kelamin',       value: profil?.jenis_kelamin     },
                  { label: 'Status Kepegawaian',  value: profil?.status_kepegawaian},
                  { label: 'Pendidikan Terakhir', value: profil?.pendidikan_terakhir},
                  { label: 'Jabatan',             value: profil?.jabatan           },
                  { label: 'Bidang Ajar',         value: profil?.bidang_ajar       },
                  { label: 'Unit Kerja',          value: profil?.unit_kerja        },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-gray-700">{item.value || '—'}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-1">Alamat</p>
                  <p className="text-sm font-medium text-gray-700">{profil?.alamat || '—'}</p>
                </div>
              </div>
            ) : (
              // EDIT MODE
              <form onSubmit={handleAjukan} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                  ⚠️ Perubahan profil memerlukan verifikasi dari admin sebelum diterapkan.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(FIELD_LABELS).map(([key, label]) => (
                    <div key={key} className={key === 'alamat' ? 'col-span-2' : ''}>
                      <label className="text-xs text-gray-500 font-medium block mb-1.5">{label}</label>
                      {key === 'alamat' ? (
                        <textarea value={form[key]} onChange={e => set(key, e.target.value)}
                          className={inputCls + ' resize-none'} rows={2} />
                      ) : key === 'jenis_kelamin' ? (
                        <select value={form[key]} onChange={e => set(key, e.target.value)} className={inputCls}>
                          <option value="">Pilih</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      ) : key === 'unit_kerja' ? (
                        <select value={form[key]} onChange={e => set(key, e.target.value)} className={inputCls}>
                          <option value="">Pilih Unit</option>
                          {['Unit SD','Unit SMP','Unit SMA','Unit SMK','Yayasan/Pusat'].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      ) : key === 'tanggal_lahir' ? (
                        <input type="date" value={form[key]} onChange={e => set(key, e.target.value)} className={inputCls} />
                      ) : (
                        <input type="text" value={form[key]} onChange={e => set(key, e.target.value)}
                          placeholder={`Masukkan ${label.toLowerCase()}`} className={inputCls} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving || hasPending}
                    className="flex items-center gap-2 bg-[#054a5c] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#033a47] disabled:opacity-60">
                    <Send size={13} /> {saving ? 'Mengajukan...' : 'Ajukan Perubahan'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Riwayat Pendidikan */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#054a5c] rounded-lg flex items-center justify-center">
                <GraduationCap size={15} className="text-white" />
              </div>
              <h3 className="font-bold text-[#054a5c]">Riwayat Pendidikan</h3>
            </div>
            {profil?.pendidikan_terakhir ? (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-[#054a5c] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {profil.pendidikan_terakhir}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{profil.pendidikan_terakhir}</p>
                  <p className="text-xs text-gray-400">Pendidikan Terakhir</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada data riwayat pendidikan</p>
            )}
          </div>
        </div>

        {/* Kanan — Riwayat Request */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-[#054a5c] text-sm mb-3">Riwayat Request Perubahan</h3>
            {perubahan.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada request perubahan</p>
            ) : (
              <div className="space-y-3">
                {perubahan.map(p => {
                  const s    = STATUS_BADGE[p.status] || STATUS_BADGE.pending
                  const Icon = s.icon
                  return (
                    <div key={p.id_perubahan} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Perubahan Profil</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${s.cls}`}>
                          <Icon size={10} /> {s.label}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(p.data_baru || {}).map(([k, v]) => (
                          <div key={k} className="text-xs text-gray-500">
                            <span className="font-medium">{FIELD_LABELS[k] || k}:</span>{' '}
                            <span className="text-emerald-600">{v}</span>
                          </div>
                        ))}
                      </div>
                      {p.catatan && (
                        <p className="text-xs text-red-500 mt-2 bg-red-50 px-2 py-1 rounded-lg">
                          Catatan: {p.catatan}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-300 mt-2">
                        {new Date(p.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Foto Profil */}
      {showFotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Update Foto Profil</h3>
              <button onClick={() => { setShowFotoModal(false); setFotoPreview(null); setFotoFile(null) }}
                className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#054a5c] flex items-center justify-center mb-3 shadow-md">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : profil?.foto_url ? (
                  <img src={profil.foto_url} alt="foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{initials(profil?.nama)}</span>
                )}
              </div>
              {fotoPreview && <p className="text-xs text-gray-500">{fotoFile?.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 w-full bg-[#054a5c] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#033a47] cursor-pointer">
                <Camera size={15} /> Pilih Foto Baru
                <input type="file" className="hidden" accept="image/*"
                  ref={fotoInputRef} onChange={handleFotoChange} />
              </label>

              {fotoPreview && (
                <button onClick={handleUploadFoto} disabled={fotoLoading}
                  className="w-full bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-60">
                  {fotoLoading ? 'Mengupload...' : '✅ Simpan Foto'}
                </button>
              )}

              {profil?.foto_profil && !fotoPreview && (
                <button onClick={handleHapusFoto} disabled={fotoLoading}
                  className="flex items-center justify-center gap-2 w-full border border-red-200 text-red-500 py-2.5 rounded-xl text-sm hover:bg-red-50 disabled:opacity-60">
                  <Trash2 size={15} /> Hapus Foto
                </button>
              )}

              <button onClick={() => { setShowFotoModal(false); setFotoPreview(null); setFotoFile(null) }}
                className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}