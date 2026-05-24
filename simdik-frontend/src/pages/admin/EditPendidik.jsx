import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ChevronLeft } from 'lucide-react'
import api from '../../lib/axios'

const UNIT_KERJA = ['Unit SD', 'Unit SMP', 'Unit SMA', 'Unit SMK', 'Yayasan/Pusat']
const PENDIDIKAN = ['SMA/SMK', 'D3', 'S1', 'S2', 'S3']
const STATUS_KEP = ['PNS', 'PPPK', 'Honorer', 'GTT']

export default function EditPendidik() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [form, setForm]         = useState({
    nama: '', nik: '', email: '', no_hp: '',
    alamat: '', tempat_lahir: '', tanggal_lahir: '',
    jenis_kelamin: '', pendidikan_terakhir: '',
    status_kepegawaian: '', jabatan: '', unit_kerja: '',
  })

  useEffect(() => {
    api.get(`/admin/pendidik/${id}`)
      .then(res => {
        const d = res.data.data
        setForm({
          nama:                d.nama || '',
          nik:                 d.nik || '',
          email:               d.email || '',
          no_hp:               d.no_hp || '',
          alamat:              d.alamat || '',
          tempat_lahir:        d.tempat_lahir || '',
          tanggal_lahir:       d.tanggal_lahir || '',
          jenis_kelamin:       d.jenis_kelamin || '',
          pendidikan_terakhir: d.pendidikan_terakhir || '',
          status_kepegawaian:  d.status_kepegawaian || '',
          jabatan:             d.jabatan || '',
          unit_kerja:          d.unit_kerja || '',
        })
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.put(`/admin/pendidik/${id}`, form)
      setSuccess('Data berhasil diperbarui')
      setTimeout(() => navigate('/admin/pendidik'), 1500)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(err.response?.data?.message || 'Gagal menyimpan data')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Memuat data...</div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Dashboard &rsaquo; Data Pendidik/Tendik &rsaquo; Edit Data</p>
        <h1 className="text-2xl font-bold text-gray-800">Edit Data Pendidik & Tendik</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-100">{success}</div>
        )}

        {/* Identitas */}
        <div className="border border-gray-100 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Identitas Diri</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'nama',         label: 'Nama Lengkap'   },
              { key: 'nik',          label: 'NIK'            },
              { key: 'email',        label: 'Email', type: 'email' },
              { key: 'no_hp',        label: 'No. HP'         },
              { key: 'tempat_lahir', label: 'Tempat Lahir'   },
              { key: 'tanggal_lahir',label: 'Tanggal Lahir', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Alamat</label>
              <textarea
                value={form.alamat}
                onChange={e => set('alamat', e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Jenis Kelamin</label>
              <select
                value={form.jenis_kelamin}
                onChange={e => set('jenis_kelamin', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20"
              >
                <option value="">Pilih</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kepegawaian */}
        <div className="border border-gray-100 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Data Kepegawaian</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Status Kepegawaian</label>
              <select value={form.status_kepegawaian} onChange={e => set('status_kepegawaian', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20">
                <option value="">Pilih Status</option>
                {STATUS_KEP.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Pendidikan Terakhir</label>
              <select value={form.pendidikan_terakhir} onChange={e => set('pendidikan_terakhir', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20">
                <option value="">Pilih Pendidikan</option>
                {PENDIDIKAN.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Unit Kerja</label>
              <select value={form.unit_kerja} onChange={e => set('unit_kerja', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20">
                <option value="">Pilih Unit</option>
                {UNIT_KERJA.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Jabatan</label>
              <input type="text" value={form.jabatan} onChange={e => set('jabatan', e.target.value)}
                placeholder="contoh: Guru Matematika"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/pendidik')}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
          <ChevronLeft size={15} /> Kembali
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-60">
          <Save size={15} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}