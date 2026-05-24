import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { FileText, BarChart2, Plus, Download, Clock, ChevronRight, X, Settings2, Trash2 } from 'lucide-react'
import api from '../../lib/axios'

const CHART_COLORS = ['#1a4a6b', '#2a6a9b', '#4a9ab5', '#90b8d0', '#b8d4e8', '#f0a020']

const KOLOM_TERSEDIA = [
  { key: 'nama',                label: 'Nama'               },
  { key: 'nik',                 label: 'NIK'                },
  { key: 'email',               label: 'Email'              },
  { key: 'no_hp',               label: 'No. HP'             },
  { key: 'status_kepegawaian',  label: 'Status Kepegawaian' },
  { key: 'pendidikan_terakhir', label: 'Pendidikan Terakhir'},
  { key: 'unit_kerja',          label: 'Unit Kerja'         },
  { key: 'jabatan',             label: 'Jabatan'            },
  { key: 'status_verifikasi',   label: 'Status Verifikasi'  },
  { key: 'tanggal_verifikasi',  label: 'Tanggal Verifikasi' },
]

const SUMBER_CHART = [
  { key: 'status_kepegawaian',  label: 'Status Kepegawaian'  },
  { key: 'pendidikan_terakhir', label: 'Pendidikan Terakhir' },
  { key: 'registrasi_bulanan',  label: 'Tren Registrasi'     },
  { key: 'status_verifikasi',   label: 'Status Verifikasi'   },
]

const TIPE_CHART = ['bar', 'line', 'pie']

export default function Laporan() {
  const [mode, setMode]             = useState('home') // home | builder-formal | builder-grafis | preview
  const [templates, setTemplates]   = useState([])
  const [riwayat, setRiwayat]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [chartData, setChartData]   = useState(null)

  // Konfigurasi laporan formal
  const [judulFormal, setJudulFormal]     = useState('')
  const [institusi, setInstitusi]         = useState('')
  const [kolom, setKolom]                 = useState(['nama','nik','status_kepegawaian'])
  const [filterKep, setFilterKep]         = useState([])
  const [dariTgl, setDariTgl]             = useState('')
  const [sampaiTgl, setSampaiTgl]         = useState('')
  const [tampilRingkasan, setTampilRingkasan] = useState(true)
  const [tampilTtd, setTampilTtd]         = useState(true)
  const [catatan, setCatatan]             = useState('')

  // Konfigurasi laporan grafis
  const [judulGrafis, setJudulGrafis]     = useState('')
  const [charts, setCharts]               = useState([
    { id: 'chart_1', tipe: 'pie', judul: 'Sebaran Kepegawaian', sumber_data: 'status_kepegawaian' }
  ])

  useEffect(() => {
    api.get('/admin/laporan/template').then(res => setTemplates(res.data.templates || [])).catch(() => {})
    api.get('/admin/laporan/riwayat').then(res => setRiwayat(res.data.data || [])).catch(() => {})
  }, [])

  const toggleKolom = (key) => {
    setKolom(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const buildKonfigFormal = () => ({
    institusi,
    kolom_data: kolom,
    rentang_waktu: { dari: dariTgl, sampai: sampaiTgl },
    filter: { status_kepegawaian: filterKep },
    urutkan: { kolom: 'nama', arah: 'asc' },
    tampilkan_ringkasan: tampilRingkasan,
    tampilkan_tanda_tangan: tampilTtd,
    catatan_kaki: catatan,
  })

  const buildKonfigGrafis = () => ({ grafik: charts })

  const handlePreviewFormal = async () => {
    setLoading(true)
    try {
      const res = await api.post('/admin/laporan/preview', { konfigurasi: buildKonfigFormal() })
      setPreviewData(res.data)
      setMode('preview')
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewGrafis = async () => {
    setLoading(true)
    try {
      const res = await api.post('/admin/laporan/generate', {
        judul: judulGrafis || 'Laporan Grafis',
        tipe: 'grafis',
        konfigurasi: buildKonfigGrafis(),
      })
      setChartData(res.data.chart_data)
      setMode('preview-grafis')
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePDF = async () => {
    setLoading(true)
    try {
      const res = await api.post('/admin/laporan/generate', {
        judul: judulFormal || 'Laporan Pendidik',
        tipe: 'formal',
        konfigurasi: buildKonfigFormal(),
      }, { responseType: 'blob' })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `${judulFormal || 'laporan'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = (tmpl) => {
    if (tmpl.tipe === 'formal') {
      const k = tmpl.konfigurasi
      setKolom(k.kolom_data || [])
      setTampilRingkasan(k.tampilkan_ringkasan ?? true)
      setTampilTtd(k.tampilkan_tanda_tangan ?? true)
      setCatatan(k.catatan_kaki || '')
      setJudulFormal(tmpl.nama)
      setMode('builder-formal')
    } else {
      setCharts(tmpl.konfigurasi.grafik || [])
      setJudulGrafis(tmpl.nama)
      setMode('builder-grafis')
    }
  }

  const addChart = () => {
    setCharts(prev => [...prev, {
      id: `chart_${Date.now()}`,
      tipe: 'bar',
      judul: 'Chart Baru',
      sumber_data: 'status_kepegawaian',
    }])
  }

  const updateChart = (id, key, val) => {
    setCharts(prev => prev.map(c => c.id === id ? { ...c, [key]: val } : c))
  }

  const removeChart = (id) => {
    setCharts(prev => prev.filter(c => c.id !== id))
  }

  // ─── Render Chart ────────────────────────────────────
  const renderChart = (chartCfg, data) => {
    if (!data) return <p className="text-gray-400 text-sm text-center py-8">Tidak ada data</p>

    if (chartCfg.tipe === 'pie') {
      const pieData = data.labels?.map((l, i) => ({ name: l, value: data.data?.[i] || 0 })) || []
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (chartCfg.tipe === 'bar') {
      const barData = data.labels?.map((l, i) => ({ name: l, nilai: data.data?.[i] || 0 })) || []
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="nilai" fill="#1a4a6b" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (chartCfg.tipe === 'line') {
      const lineData = data.labels?.map((l, i) => ({ name: l, nilai: data.data?.[i] || 0 })) || []
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="nilai" stroke="#1a4a6b" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )
    }
  }

  // ─── HOME ─────────────────────────────────────────────
  if (mode === 'home') return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
        <p className="text-sm text-gray-400 mt-1">Buat laporan formal atau visualisasi data secara kustom.</p>
      </div>

      {/* Buat Laporan Baru */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMode('builder-formal')}
          className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#1a4a6b]/20"
        >
          <div className="w-12 h-12 bg-[#1a4a6b] rounded-xl flex items-center justify-center mb-4">
            <FileText size={22} className="text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">Laporan Formal</h3>
          <p className="text-sm text-gray-400">Buat laporan tabel resmi yang bisa diunduh sebagai PDF. Kustomisasi kolom, filter, dan format.</p>
          <div className="flex items-center gap-1 text-[#1a4a6b] text-sm font-medium mt-4">
            Buat Sekarang <ChevronRight size={14} />
          </div>
        </button>

        <button
          onClick={() => setMode('builder-grafis')}
          className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#1a4a6b]/20"
        >
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
            <BarChart2 size={22} className="text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">Laporan Grafis</h3>
          <p className="text-sm text-gray-400">Buat visualisasi data interaktif dengan berbagai jenis grafik. Pilih data, tipe chart, dan warna.</p>
          <div className="flex items-center gap-1 text-amber-500 text-sm font-medium mt-4">
            Buat Sekarang <ChevronRight size={14} />
          </div>
        </button>
      </div>

      {/* Template */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Template Siap Pakai</h3>
        <div className="grid grid-cols-2 gap-3">
          {templates.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => loadTemplate(tmpl)}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl text-left hover:border-[#1a4a6b]/40 hover:bg-[#1a4a6b]/5 transition-all"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tmpl.tipe === 'formal' ? 'bg-[#1a4a6b]' : 'bg-amber-500'}`}>
                {tmpl.tipe === 'formal' ? <FileText size={14} className="text-white" /> : <BarChart2 size={14} className="text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{tmpl.nama}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tmpl.deskripsi}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Riwayat */}
      {riwayat.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={16} /> Riwayat Laporan
          </h3>
          <div className="space-y-2">
            {riwayat.slice(0, 5).map(r => (
              <div key={r.id_laporan} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${r.tipe === 'formal' ? 'bg-[#1a4a6b]/10' : 'bg-amber-100'}`}>
                    {r.tipe === 'formal' ? <FileText size={12} className="text-[#1a4a6b]" /> : <BarChart2 size={12} className="text-amber-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.judul}</p>
                    <p className="text-xs text-gray-400">{new Date(r.tanggal_laporan).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                {r.file_path && (
                  <a href={`http://localhost:8000/api/admin/laporan/${r.id_laporan}/download`}
                    className="text-[#1a4a6b] hover:underline text-xs flex items-center gap-1">
                    <Download size={12} /> Unduh
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ─── BUILDER FORMAL ───────────────────────────────────
  if (mode === 'builder-formal') return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode('home')} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Builder Laporan Formal</h1>
          <p className="text-sm text-gray-400">Kustomisasi laporan sesuai kebutuhan</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        {/* Judul & Institusi */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Judul Laporan</label>
            <input value={judulFormal} onChange={e => setJudulFormal(e.target.value)}
              placeholder="contoh: Laporan Data Pendidik 2024"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Nama Institusi</label>
            <input value={institusi} onChange={e => setInstitusi(e.target.value)}
              placeholder="contoh: SMK Negeri 1 ..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20" />
          </div>
        </div>

        {/* Rentang Waktu */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Rentang Waktu Data</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Dari</p>
              <input type="date" value={dariTgl} onChange={e => setDariTgl(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Sampai</p>
              <input type="date" value={sampaiTgl} onChange={e => setSampaiTgl(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20" />
            </div>
          </div>
        </div>

        {/* Pilih Kolom */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Kolom Data yang Ditampilkan</label>
          <div className="grid grid-cols-3 gap-2">
            {KOLOM_TERSEDIA.map(k => (
              <button key={k.key} onClick={() => toggleKolom(k.key)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all
                  ${kolom.includes(k.key) ? 'bg-[#1a4a6b] text-white border-[#1a4a6b]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a4a6b]/40'}`}>
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Status Kepegawaian */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Filter Status Kepegawaian</label>
          <div className="flex gap-2 flex-wrap">
            {['PNS', 'PPPK', 'Honorer', 'GTT'].map(s => (
              <button key={s} onClick={() => setFilterKep(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                  ${filterKep.includes(s) ? 'bg-[#1a4a6b] text-white border-[#1a4a6b]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a4a6b]/40'}`}>
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Kosongkan untuk menampilkan semua status</p>
        </div>

        {/* Opsi Tampilan */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Opsi Tampilan</label>
          <div className="space-y-2">
            {[
              { label: 'Tampilkan ringkasan statistik', val: tampilRingkasan, set: setTampilRingkasan },
              { label: 'Tampilkan kolom tanda tangan',  val: tampilTtd,       set: setTampilTtd       },
            ].map((opt, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={opt.val} onChange={e => opt.set(e.target.checked)}
                  className="rounded" />
                <span className="text-sm text-gray-600">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Catatan Kaki */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Catatan Kaki</label>
          <input value={catatan} onChange={e => setCatatan(e.target.value)}
            placeholder="contoh: Dicetak oleh sistem SIMDIK"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button onClick={handlePreviewFormal} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#1a4a6b] text-[#1a4a6b] rounded-xl text-sm font-medium hover:bg-[#1a4a6b]/5 disabled:opacity-60">
          <Settings2 size={15} /> {loading ? 'Memuat...' : 'Preview Data'}
        </button>
        <button onClick={handleGeneratePDF} disabled={loading}
          className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-60">
          <Download size={15} /> {loading ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>
    </div>
  )

  // ─── BUILDER GRAFIS ───────────────────────────────────
  if (mode === 'builder-grafis') return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode('home')} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Builder Laporan Grafis</h1>
          <p className="text-sm text-gray-400">Susun visualisasi data sesuai kebutuhan</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Judul Laporan Grafis</label>
          <input value={judulGrafis} onChange={e => setJudulGrafis(e.target.value)}
            placeholder="contoh: Sebaran Data Pendidik 2024"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20" />
        </div>

        {/* Chart Cards */}
        <div className="grid grid-cols-2 gap-4">
          {charts.map(chart => (
            <div key={chart.id} className="border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input value={chart.judul} onChange={e => updateChart(chart.id, 'judul', e.target.value)}
                  className="font-semibold text-gray-800 text-sm bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-[#1a4a6b] w-full mr-2" />
                <button onClick={() => removeChart(chart.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tipe Chart</p>
                  <select value={chart.tipe} onChange={e => updateChart(chart.id, 'tipe', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                    {TIPE_CHART.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Sumber Data</p>
                  <select value={chart.sumber_data} onChange={e => updateChart(chart.id, 'sumber_data', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                    {SUMBER_CHART.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {chart.sumber_data === 'registrasi_bulanan' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Dari</p>
                    <input type="date" value={chart.rentang_waktu?.dari || ''}
                      onChange={e => updateChart(chart.id, 'rentang_waktu', { ...chart.rentang_waktu, dari: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Sampai</p>
                    <input type="date" value={chart.rentang_waktu?.sampai || ''}
                      onChange={e => updateChart(chart.id, 'rentang_waktu', { ...chart.rentang_waktu, sampai: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Tambah Chart */}
          <button onClick={addChart}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#1a4a6b]/40 hover:bg-[#1a4a6b]/5 transition-all min-h-32">
            <Plus size={24} className="text-gray-300" />
            <p className="text-sm text-gray-400">Tambah Chart</p>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handlePreviewGrafis} disabled={loading}
          className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-60">
          <BarChart2 size={15} /> {loading ? 'Generating...' : 'Generate Grafis'}
        </button>
      </div>
    </div>
  )

  // ─── PREVIEW FORMAL ───────────────────────────────────
  if (mode === 'preview' && previewData) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('builder-formal')} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Preview Laporan</h1>
        </div>
        <button onClick={handleGeneratePDF} disabled={loading}
          className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a] disabled:opacity-60">
          <Download size={15} /> {loading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">
            Total: <strong>{previewData.ringkasan?.total || 0}</strong> data
          </p>
          <div className="flex gap-3">
            {Object.entries(previewData.ringkasan?.per_status_kepegawaian || {}).map(([k, v]) => (
              <span key={k} className="text-xs bg-[#1a4a6b]/10 text-[#1a4a6b] px-2 py-1 rounded-lg">
                {k}: {v}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a4a6b] text-white text-xs">
                <th className="text-left px-4 py-3">#</th>
                {previewData.kolom?.map(k => (
                  <th key={k} className="text-left px-4 py-3 capitalize">{k.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {previewData.data?.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                  {previewData.kolom?.map(k => (
                    <td key={k} className="px-4 py-3 text-sm text-gray-700">{row[k] || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // ─── PREVIEW GRAFIS ───────────────────────────────────
  if (mode === 'preview-grafis' && chartData) return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode('builder-grafis')} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Preview Grafis — {judulGrafis}</h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {charts.map((chartCfg, i) => {
          const data = chartData[i]
          return (
            <div key={chartCfg.id} className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">{chartCfg.judul}</h3>
              {renderChart(chartCfg, data)}
            </div>
          )
        })}
      </div>
    </div>
  )

  return null
}