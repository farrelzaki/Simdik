import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Upload, CheckCircle, X } from 'lucide-react'
import api from '../lib/axios'

const STATUS_KEP = [
  { value: 'PNS',     label: 'PNS / PPPK',  desc: 'ASN Aktif Pemerintah'   },
  { value: 'GTT',     label: 'GTY / PTY',    desc: 'Pegawai Tetap Yayasan'  },
  { value: 'Honorer', label: 'Guru Honor',   desc: 'Tenaga Kerja Lepas'     },
]

const JENJANG = ['S1', 'S2', 'S3', 'D3', 'D4']

export default function Register() {
  const navigate  = useNavigate()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    nama: '', nik: '', email: '', password: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '',
    alamat: '', no_hp: '', status_kepegawaian: '',
    pendidikan_terakhir: '', jabatan: '', unit_kerja: '',
    bidang_ajar: '',
  })

  // Step 2 — riwayat pendidikan
  const [riwayatPendidikan, setRiwayatPendidikan] = useState([])
  const [formPendidikan, setFormPendidikan] = useState({
    institusi: '', jenjang: '', tahun_lulus: '', jurusan: ''
  })

  // Step 3 — berkas
  const [berkas, setBerkas] = useState({
    file_identitas: null,
    file_kualifikasi: null,
    file_sertifikasi: null,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const tambahRiwayat = () => {
    if (!formPendidikan.institusi || !formPendidikan.jenjang) return
    setRiwayatPendidikan(prev => [...prev, formPendidikan])
    // Otomatis set pendidikan_terakhir dari jenjang tertinggi yang dimasukkan
    set('pendidikan_terakhir', formPendidikan.jenjang)
    setFormPendidikan({ institusi: '', jenjang: '', tahun_lulus: '', jurusan: '' })
  }
  const hapusRiwayat = (i) => {
    setRiwayatPendidikan(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      fd.append('password_confirmation', form.password)
      if (berkas.file_identitas)   fd.append('file_identitas',   berkas.file_identitas)
      if (berkas.file_kualifikasi) fd.append('file_kualifikasi', berkas.file_kualifikasi)
      if (berkas.file_sertifikasi) fd.append('file_sertifikasi', berkas.file_sertifikasi)

      await api.post('/auth/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Simpan data form ke localStorage agar halaman pending bisa menampilkannya
      localStorage.setItem('pending_user', JSON.stringify({
        nama:                form.nama,
        email:               form.email,
        no_hp:               form.no_hp,
        nik:                 form.nik,
        alamat:              form.alamat,
        status_kepegawaian:  form.status_kepegawaian,
        pendidikan_terakhir: form.pendidikan_terakhir,
        status_akun:         'pending',
      }))

      navigate('/pending')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors).flat().join(' • '))
      } else {
        setError(err.response?.data?.message || 'Registrasi gagal')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Styles ───────────────────────────────────────────
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-[#fcfdfe] focus:outline-none focus:border-[#054a5c] focus:ring-2 focus:ring-[#054a5c]/10"
  const labelCls = "text-sm font-medium text-gray-600 block mb-1.5"

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3eff4] via-[#dbebe9] to-[#cfe6e2] py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#054a5c" />
              <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="#0e7d71" />
              <path d="M35 40 Q50 25 65 40 L65 65 Q50 75 35 65 Z" fill="#e8a020" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#054a5c]">
            {step === 1 ? 'Pendaftaran Tenaga Pendidik' : step === 2 ? 'Kualifikasi & Sertifikasi' : 'Unggah Pemberkasan'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? 'Isi data diri Anda dengan lengkap dan benar' : step === 2 ? 'Kelola riwayat pendidikan dan sertifikasi Anda' : 'Unggah dokumen pendukung pendaftaran'}
          </p>
        </div>

        {/* Stepper */}
        <div className="relative flex justify-between items-start mb-10 px-12">
          <div className="absolute top-4 left-[20%] right-[20%] h-0.5 bg-gray-200 z-0" />
          <div className={`absolute top-4 left-[20%] h-0.5 z-0 bg-[#054a5c] transition-all duration-500
            ${step === 1 ? 'w-0' : step === 2 ? 'w-[35%]' : 'w-[70%]'}`} />
          {[
            { n: 1, label: 'Identitas Diri'   },
            { n: 2, label: 'Kualifikasi'       },
            { n: 3, label: 'Unggah Berkas'     },
          ].map(s => (
            <div key={s.n} className="relative z-10 text-center bg-transparent px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm transition-all
                ${step >= s.n ? 'bg-[#054a5c] text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <p className={`text-xs font-medium ${step >= s.n ? 'text-[#054a5c]' : 'text-gray-400'}`}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Informasi Akun */}
            <Card icon="👤" title="Informasi Akun" sub="Buat nama pengguna dan kata sandi.">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nama Pengguna</label>
                  <input className={inputCls} placeholder="Masukkan nama pengguna"
                    value={form.nama} onChange={e => set('nama', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Kata Sandi</label>
                  <div className="relative">
                    <input className={inputCls + ' pr-10'} type={showPass ? 'text' : 'password'}
                      placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Informasi Personal */}
            <Card icon="🪪" title="Informasi Personal" sub="Data sesuai kartu identitas resmi">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nama Lengkap</label>
                  <input className={inputCls} placeholder="Masukkan nama lengkap beserta gelar"
                    value={form.nama} onChange={e => set('nama', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>NIK</label>
                  <input className={inputCls} placeholder="16 digit nomor NIK" maxLength={16}
                    value={form.nik} onChange={e => set('nik', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Tempat Lahir</label>
                  <input className={inputCls} placeholder="Kota/Kabupaten"
                    value={form.tempat_lahir} onChange={e => set('tempat_lahir', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Tanggal Lahir</label>
                  <input className={inputCls} type="date"
                    value={form.tanggal_lahir} onChange={e => set('tanggal_lahir', e.target.value)} />
                </div>
              </div>
            </Card>

            {/* Kontak & Domisili */}
            <Card icon="📍" title="Kontak & Domisili" sub="Alamat tinggal dan informasi kontak aktif">
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Alamat Domisili</label>
                  <textarea className={inputCls + ' resize-none'} rows={2}
                    placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                    value={form.alamat} onChange={e => set('alamat', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nomor HP</label>
                    <div className="flex">
                      <span className="px-3 py-2.5 bg-white border border-r-0 border-gray-200 rounded-l-lg text-sm font-semibold text-gray-600">+62</span>
                      <input className={inputCls + ' rounded-l-none'} placeholder="8123456789"
                        value={form.no_hp} onChange={e => set('no_hp', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input className={inputCls} type="email" placeholder="nama@edu.id"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Status Kepegawaian */}
            <Card icon="💼" title="Status Kepegawaian" sub="Pilih status keaktifan mengajar Anda">
              <div className="grid grid-cols-3 gap-3">
                {STATUS_KEP.map(s => (
                  <button key={s.value} type="button"
                    onClick={() => set('status_kepegawaian', s.value)}
                    className={`border-2 rounded-xl p-3 text-left transition-all
                      ${form.status_kepegawaian === s.value
                        ? 'border-[#054a5c] bg-[#f0f7fa]'
                        : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-start gap-2">
                      <input type="radio" readOnly checked={form.status_kepegawaian === s.value}
                        className="mt-1 accent-[#054a5c]" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Minat Penempatan */}
            <Card icon="🎯" title="Minat Penempatan" sub="Bidang ajar dan posisi yang diminati">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Bidang Ajar</label>
                  <input className={inputCls} placeholder="Contoh: Matematika"
                    value={form.bidang_ajar} onChange={e => set('bidang_ajar', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Jabatan / Posisi</label>
                  <input className={inputCls} placeholder="Contoh: Guru"
                    value={form.jabatan} onChange={e => set('jabatan', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Unit Kerja</label>
                  <select className={inputCls}
                    value={form.unit_kerja} onChange={e => set('unit_kerja', e.target.value)}>
                    <option value="">Pilih Unit Kerja</option>
                    {['Unit SD', 'Unit SMP', 'Unit SMA', 'Unit SMK', 'Yayasan/Pusat'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Riwayat Pendidikan */}
            <Card icon="🎓" title="Riwayat Pendidikan" sub="Tambahkan riwayat pendidikan formal Anda">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-2">
                  <label className={labelCls}>Nama Institusi</label>
                  <input className={inputCls} placeholder="Contoh: Universitas Indonesia"
                    value={formPendidikan.institusi}
                    onChange={e => setFormPendidikan(f => ({ ...f, institusi: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Jenjang</label>
                  <select className={inputCls}
                    value={formPendidikan.jenjang}
                    onChange={e => setFormPendidikan(f => ({ ...f, jenjang: e.target.value }))}>
                    <option value="">Pilih</option>
                    {JENJANG.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Program Studi / Jurusan</label>
                  <input className={inputCls} placeholder="Contoh: Teknologi Pendidikan"
                    value={formPendidikan.jurusan}
                    onChange={e => setFormPendidikan(f => ({ ...f, jurusan: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Tahun Lulus</label>
                  <input className={inputCls} type="number" placeholder="2024"
                    value={formPendidikan.tahun_lulus}
                    onChange={e => setFormPendidikan(f => ({ ...f, tahun_lulus: e.target.value }))} />
                </div>
              </div>
              <button type="button" onClick={tambahRiwayat}
                className="w-full bg-[#054a5c] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#033a47]">
                + Tambah Riwayat
              </button>

              {/* Daftar riwayat */}
              {riwayatPendidikan.length > 0 && (
                <div className="mt-3 space-y-2">
                  {riwayatPendidikan.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#f0f7fa] rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#054a5c]">{r.jenjang} — {r.institusi}</p>
                        <p className="text-xs text-gray-500">{r.jurusan} • {r.tahun_lulus}</p>
                      </div>
                      <button onClick={() => hapusRiwayat(i)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Sertifikasi */}
            <Card icon="🏆" title="Sertifikasi" sub="Tambahkan sertifikasi profesional (opsional)">
              <div className="mb-3">
                <label className={labelCls}>Nama Sertifikasi</label>
                <input className={inputCls} placeholder="Contoh: Sertifikasi Pendidik"
                  value={form.nama_sertifikasi || ''}
                  onChange={e => set('nama_sertifikasi', e.target.value)} />
              </div>
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
                  ${berkas.file_sertifikasi
                    ? 'border-[#054a5c] bg-[#054a5c]/5'
                    : 'border-gray-300 hover:border-[#054a5c]/40 hover:bg-[#054a5c]/5'}`}>
                  {berkas.file_sertifikasi ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">✅</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#054a5c]">{berkas.file_sertifikasi.name}</p>
                        <p className="text-xs text-gray-400">Klik untuk ganti file</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Klik untuk upload atau seret file ke sini</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG maksimal 2MB</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setBerkas(b => ({ ...b, file_sertifikasi: e.target.files[0] }))} />
              </label>
            </Card>
          </div>
        )}

        {/* ─── STEP 3 ─── */}
        {step === 3 && (
          <div className="space-y-4">
            <Card icon="📁" title="Unggah Berkas" sub="Unggah dokumen pendukung pendaftaran Anda">
              <div className="space-y-3">
                {[
                  { key: 'file_identitas',   label: 'KTP / Identitas',     required: true,  accept: '.pdf,.jpg,.jpeg,.png', icon: '🪪' },
                  { key: 'file_kualifikasi', label: 'Ijazah Terakhir',      required: true,  accept: '.pdf',                 icon: '📜' },
                  { key: 'file_sertifikasi', label: 'Sertifikat Pendidik',  required: false, accept: '.pdf,.jpg,.jpeg,.png', icon: '🏆' },
                ].map(doc => (
                  <div key={doc.key}
                    className={`flex items-center justify-between border rounded-xl px-4 py-4 transition-all
                      ${berkas[doc.key] ? 'border-[#0e7d71] bg-[#eaf8f5]' : 'border-dashed border-gray-300 hover:border-[#054a5c]/40 hover:bg-[#054a5c]/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {berkas[doc.key] ? <CheckCircle size={20} className="text-[#0e7d71]" /> : doc.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {berkas[doc.key] ? berkas[doc.key].name : doc.label}
                          {!doc.required && <span className="text-xs text-gray-400 font-normal ml-1">(opsional)</span>}
                        </p>
                        <p className="text-xs text-gray-400">Maksimal 5MB</p>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-[#054a5c] hover:bg-gray-50 shadow-sm">
                        {berkas[doc.key] ? 'Ganti' : 'Pilih Berkas'}
                      </span>
                      <input type="file" className="hidden" accept={doc.accept}
                        onChange={e => setBerkas(b => ({ ...b, [doc.key]: e.target.files[0] }))} />
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button type="button"
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/login')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            <ArrowLeft size={15} /> {step > 1 ? 'Kembali' : 'Batal'}
          </button>
          <div className="flex gap-3">
            <button type="button"
              className="px-4 py-2.5 text-[#054a5c] font-medium rounded-lg text-sm bg-[#e6f0f5] hover:bg-[#d1e3ec]">
              Simpan Draft
            </button>
            {step < 3 ? (
              <button type="button" onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 bg-[#054a5c] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#033a47]">
                Save & Next <ArrowRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 bg-[#054a5c] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#033a47] disabled:opacity-60">
                {loading ? 'Mendaftar...' : 'Kirim Pendaftaran'} <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#054a5c] font-semibold hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}

function Card({ icon, title, sub, children }) {
  return (
    <div className="bg-[#f8fbfc] rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-[#054a5c] text-white rounded-lg flex items-center justify-center text-base">{icon}</div>
        <div>
          <h3 className="text-sm font-semibold text-[#054a5c]">{title}</h3>
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}