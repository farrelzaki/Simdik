import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, MapPin, Briefcase, ChevronRight, ChevronLeft, Save } from 'lucide-react'
import api from '../../lib/axios'

const steps = [
  { id: 1, label: 'Identitas Diri',  icon: User      },
  { id: 2, label: 'Kualifikasi',     icon: Briefcase },
  { id: 3, label: 'Unggah Berkas',   icon: Save      },
]

const STATUS_KEPEGAWAIAN = [
  { value: 'PNS',    label: 'PNS / PPPK',   sub: 'ASN aktif Pemerintah'  },
  { value: 'GTT',    label: 'GTY / PTY',     sub: 'Pegawai Tetap Yayasan' },
  { value: 'Honorer',label: 'Guru Honor',    sub: 'Tenaga Kerja Lepas'    },
]

const PENDIDIKAN = ['SMA/SMK', 'D3', 'S1', 'S2', 'S3']
const UNIT_KERJA = ['Unit SD', 'Unit SMP', 'Unit SMA', 'Unit SMK', 'Yayasan/Pusat']

export default function TambahPendidik() {
  const navigate  = useNavigate()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    // Step 1
    nama: '', nik: '', email: '', password: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '',
    alamat: '', no_hp: '', status_kepegawaian: '',
    // Step 2
    pendidikan_terakhir: '', jabatan: '', unit_kerja: '',
    // Step 3
    file_identitas: null, file_kualifikasi: null, file_sertifikasi: null,
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v)
      })
      await api.post('/admin/pendidik', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      navigate('/admin/pendidik')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(err.response?.data?.message || 'Gagal menyimpan data')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-400 mb-1">
          Dashboard &rsaquo; Data Pendidik/Tendik &rsaquo; Tambah Data
        </p>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Data Pendidik & Tendik</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola data guru, staf administrasi, dan tenaga kependidikan lainnya.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${step === s.id ? 'bg-[#1a4a6b] text-white' : step > s.id ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`text-sm font-medium ${step === s.id ? 'text-[#1a4a6b]' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${step > s.id ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Step 1 — Identitas */}
        {step === 1 && (
          <>
            {/* Informasi Akun */}
            <Section icon="👤" title="Informasi Akun" sub="Buat nama pengguna dan kata sandi.">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nama Pengguna" placeholder="Masukkan nama pengguna"
                  value={form.nama} onChange={v => set('nama', v)} />
                <Field label="Kata Sandi" type="password" placeholder="Min. 8 karakter"
                  value={form.password} onChange={v => set('password', v)} />
              </div>
            </Section>

            {/* Informasi Personal */}
            <Section icon="🪪" title="Informasi Personal" sub="Data sesuai kartu identitas resmi">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nama Lengkap" placeholder="Masukkan nama lengkap beserta gelar"
                  value={form.nama} onChange={v => set('nama', v)} />
                <Field label="Nomor Induk Kependudukan (NIK)" placeholder="16 digit nomor NIK"
                  value={form.nik} onChange={v => set('nik', v)} />
                <Field label="Tempat Lahir" placeholder="Kota/Kabupaten"
                  value={form.tempat_lahir} onChange={v => set('tempat_lahir', v)} />
                <Field label="Tanggal Lahir" type="date"
                  value={form.tanggal_lahir} onChange={v => set('tanggal_lahir', v)} />
              </div>
            </Section>

            {/* Kontak & Domisili */}
            <Section icon="📍" title="Kontak & Domisili" sub="Alamat tinggal dan informasi kontak aktif">
              <div className="space-y-4">
                <Field label="Alamat Domisili" placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                  value={form.alamat} onChange={v => set('alamat', v)} textarea />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nomor HP" placeholder="81234567890"
                    value={form.no_hp} onChange={v => set('no_hp', v)} prefix="+62" />
                  <Field label="Email" placeholder="nama@edu.id" type="email"
                    value={form.email} onChange={v => set('email', v)} />
                </div>
              </div>
            </Section>

            {/* Status Kepegawaian */}
            <Section icon="💼" title="Status Kepegawaian" sub="Pilih status keaktifan mengajar Anda">
              <div className="grid grid-cols-3 gap-3">
                {STATUS_KEPEGAWAIAN.map(s => (
                  <button key={s.value}
                    onClick={() => set('status_kepegawaian', s.value)}
                    className={`border-2 rounded-xl p-3 text-left transition-all
                      ${form.status_kepegawaian === s.value ? 'border-[#1a4a6b] bg-[#1a4a6b]/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Step 2 — Kualifikasi */}
        {step === 2 && (
          <>
            <Section icon="🎓" title="Kualifikasi Pendidikan" sub="Riwayat pendidikan formal terakhir">
              <div className="grid grid-cols-2 gap-3">
                {PENDIDIKAN.map(p => (
                  <button key={p}
                    onClick={() => set('pendidikan_terakhir', p)}
                    className={`border-2 rounded-xl p-3 text-left transition-all
                      ${form.pendidikan_terakhir === p ? 'border-[#1a4a6b] bg-[#1a4a6b]/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <p className="text-sm font-semibold text-gray-800">{p}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section icon="🏫" title="Penempatan" sub="Unit kerja dan jabatan">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Unit Kerja</label>
                  <select
                    value={form.unit_kerja}
                    onChange={e => set('unit_kerja', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20"
                  >
                    <option value="">Pilih Unit Kerja</option>
                    {UNIT_KERJA.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <Field label="Jabatan" placeholder="contoh: Guru Matematika"
                  value={form.jabatan} onChange={v => set('jabatan', v)} />
              </div>
            </Section>
          </>
        )}

        {/* Step 3 — Berkas */}
        {step === 3 && (
          <Section icon="📁" title="Unggah Berkas" sub="Upload dokumen pendukung">
            <div className="space-y-4">
              {[
                { key: 'file_identitas',   label: 'KTP / Identitas',    required: true  },
                { key: 'file_kualifikasi', label: 'Ijazah / Kualifikasi', required: true  },
                { key: 'file_sertifikasi', label: 'Sertifikasi',         required: false },
              ].map(doc => (
                <div key={doc.key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    {doc.label} {doc.required && <span className="text-red-500">*</span>}
                    {!doc.required && <span className="text-gray-400 text-xs ml-1">(opsional)</span>}
                  </label>
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors
                    ${form[doc.key] ? 'border-[#1a4a6b] bg-[#1a4a6b]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    {form[doc.key] ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#1a4a6b] font-medium">{form[doc.key].name}</p>
                        <button onClick={() => set(doc.key, null)} className="text-red-400 text-xs hover:text-red-600">Hapus</button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <p className="text-sm text-gray-400">Klik untuk upload atau drag & drop</p>
                        <p className="text-xs text-gray-300 mt-1">PDF, JPG, PNG max 5MB</p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={e => set(doc.key, e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/admin/pendidik')}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
        >
          <ChevronLeft size={15} /> {step > 1 ? 'Kembali' : 'Batal'}
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
            Simpan Draft
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a]"
            >
              Save & Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-60"
            >
              <Save size={15} /> {loading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components
function Section({ icon, title, sub, children }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-base">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, textarea, prefix }) {
  const cls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20"
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3} className={cls + ' resize-none'} />
      ) : prefix ? (
        <div className="flex">
          <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500">{prefix}</span>
          <input type={type} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} className={cls + ' rounded-l-none'} />
        </div>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}