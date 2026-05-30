import { useState, useEffect, useRef, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts'
import {
  FileText, BarChart2, Plus, Download, Clock, ChevronRight,
  X, Settings2, Trash2, AlertTriangle, CheckCircle, Image,
  RefreshCw, Eye, EyeOff, Hash, Type, Palette
} from 'lucide-react'
import api from '../../lib/axios'

const CHART_COLORS = ['#1a4a6b', '#2a6a9b', '#4a9ab5', '#f0a020', '#e85d4a', '#4caf50', '#9c27b0']

const KOLOM_TERSEDIA = [
  { key: 'nama', label: 'Nama' },
  { key: 'nik', label: 'NIK' },
  { key: 'email', label: 'Email' },
  { key: 'no_hp', label: 'No. HP' },
  { key: 'status_kepegawaian', label: 'Status Kepegawaian' },
  { key: 'pendidikan_terakhir', label: 'Pendidikan Terakhir' },
  { key: 'unit_kerja', label: 'Unit Kerja' },
  { key: 'jabatan', label: 'Jabatan' },
  { key: 'status_verifikasi', label: 'Status Verifikasi' },
  { key: 'tanggal_verifikasi', label: 'Tanggal Verifikasi' },
]

const SUMBER_CHART = [
  { key: 'status_kepegawaian', label: 'Status Kepegawaian', icon: '👔' },
  { key: 'pendidikan_terakhir', label: 'Pendidikan Terakhir', icon: '🎓' },
  { key: 'registrasi_bulanan', label: 'Tren Registrasi', icon: '📈' },
  { key: 'status_verifikasi', label: 'Status Verifikasi', icon: '✅' },
]

// Kompatibilitas: sumber data apa yang cocok dengan tipe chart apa
const KOMPATIBILITAS = {
  status_kepegawaian: ['bar', 'pie'],
  pendidikan_terakhir: ['bar', 'pie'],
  registrasi_bulanan: ['line', 'bar'],
  status_verifikasi: ['bar', 'pie'],
}

const TIPE_CHART = [
  { key: 'bar', label: 'Bar Chart', emoji: '📊' },
  { key: 'line', label: 'Line Chart', emoji: '📈' },
  { key: 'pie', label: 'Pie Chart', emoji: '🥧' },
]

// Pesan ketidakcocokan
const INCOMPATIBLE_MSG = {
  'registrasi_bulanan-bar': null, // kompatibel
  'registrasi_bulanan-line': null,
  'registrasi_bulanan-pie': 'Data tren bulanan tidak cocok dengan Pie Chart karena bersifat time-series. Gunakan Line atau Bar.',
  'status_kepegawaian-line': 'Data kategorikal tidak cocok dengan Line Chart. Gunakan Bar atau Pie.',
  'pendidikan_terakhir-line': 'Data kategorikal tidak cocok dengan Line Chart. Gunakan Bar atau Pie.',
  'status_verifikasi-line': 'Data kategorikal tidak cocok dengan Line Chart. Gunakan Bar atau Pie.',
}

function isCompatible(sumber, tipe) {
  return (KOMPATIBILITAS[sumber] || []).includes(tipe)
}

function getIncompatibleMsg(sumber, tipe) {
  return INCOMPATIBLE_MSG[`${sumber}-${tipe}`] || (isCompatible(sumber, tipe) ? null : `Kombinasi "${sumber}" dengan "${tipe}" tidak kompatibel.`)
}

// ─── Komponen Toast Notifikasi ─────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const cfg = {
    error: { bg: 'bg-red-50 border-red-200', icon: <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />, text: 'text-red-700' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />, text: 'text-amber-700' },
    success: { bg: 'bg-green-50 border-green-200', icon: <CheckCircle size={15} className="text-green-500 flex-shrink-0" />, text: 'text-green-700' },
  }[type] || {}

  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm ${cfg.bg} ${cfg.text} shadow-lg max-w-sm`}>
      {cfg.icon}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100"><X size={13} /></button>
    </div>
  )
}

// ─── Custom Tooltip ────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-medium">{p.value} orang</p>
      ))}
    </div>
  )
}

export default function Laporan() {
  const [mode, setMode] = useState('home')
  const [templates, setTemplates] = useState([])
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [toasts, setToasts] = useState([])

  // Config laporan formal
  const [judulFormal, setJudulFormal] = useState('')
  const [institusi, setInstitusi] = useState('')
  const [kolom, setKolom] = useState(['nama', 'nik', 'status_kepegawaian'])
  const [filterKep, setFilterKep] = useState([])
  const [dariTgl, setDariTgl] = useState('')
  const [sampaiTgl, setSampaiTgl] = useState('')
  const [tampilRingkasan, setTampilRingkasan] = useState(true)
  const [tampilTtd, setTampilTtd] = useState(true)
  const [catatan, setCatatan] = useState('')

  // Config laporan grafis
  const [judulGrafis, setJudulGrafis] = useState('')
  const [charts, setCharts] = useState([
    {
      id: 'chart_1', tipe: 'pie', judul: 'Sebaran Kepegawaian',
      sumber_data: 'status_kepegawaian',
      opsi: { tampilkan_label: true, tampilkan_angka: true, tampilkan_legenda: true, warna: CHART_COLORS }
    }
  ])

  // Refs untuk chart download
  const chartContainerRef = useRef(null)

  const addToast = useCallback((msg, type = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    api.get('/admin/laporan/template').then(res => setTemplates(res.data.templates || [])).catch(() => { })
    api.get('/admin/laporan/riwayat').then(res => setRiwayat(res.data.data || [])).catch(() => { })
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

  // Validasi chart sebelum generate
  const validateCharts = () => {
    for (const c of charts) {
      const msg = getIncompatibleMsg(c.sumber_data, c.tipe)
      if (msg) {
        addToast(`"${c.judul}": ${msg}`, 'error')
        return false
      }
    }
    return true
  }

  const handlePreviewFormal = async () => {
    if (kolom.length === 0) { addToast('Pilih minimal 1 kolom data.', 'warning'); return }
    setLoading(true)
    try {
      const res = await api.post('/admin/laporan/preview', { konfigurasi: buildKonfigFormal() })
      setPreviewData(res.data)
      setMode('preview')
    } catch {
      addToast('Gagal memuat preview. Coba lagi.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewGrafis = async () => {
    if (!validateCharts()) return
    if (charts.length === 0) { addToast('Tambahkan minimal 1 chart.', 'warning'); return }
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
      addToast('Gagal generate grafis. Coba lagi.', 'error')
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
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${judulFormal || 'laporan'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      addToast('PDF berhasil diunduh!', 'success')
    } catch {
      addToast('Gagal generate PDF. Coba lagi.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Download grafis sebagai PNG — render SVG Recharts ke Canvas secara native
  const handleDownloadPNG = async () => {
    try {
      const el = chartContainerRef.current
      if (!el) { addToast('Area grafis tidak ditemukan.', 'error'); return }

      const cardEls = el.querySelectorAll('[data-chart-card]')
      if (!cardEls.length) { addToast('Tidak ada chart untuk diunduh.', 'error'); return }

      const DPR = 2
      const CARD_W = 500
      const CARD_H = 310
      const PAD = 20
      const COLS = 2
      const ROWS = Math.ceil(cardEls.length / COLS)
      const HDR_H = 56  // ruang untuk judul laporan
      const totalW = COLS * CARD_W + (COLS + 1) * PAD
      const totalH = HDR_H + ROWS * (CARD_H + PAD) + PAD

      const canvas = document.createElement('canvas')
      canvas.width = totalW * DPR
      canvas.height = totalH * DPR
      const ctx = canvas.getContext('2d')
      ctx.scale(DPR, DPR)

      // Background
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, totalW, totalH)

      // Judul laporan
      ctx.fillStyle = '#1a4a6b'
      ctx.font = 'bold 17px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(judulGrafis || 'Laporan Grafis', totalW / 2, PAD + 20)
      ctx.font = '12px system-ui, sans-serif'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, totalW / 2, PAD + 38)

      // Render tiap card: ambil SVG dari Recharts, serialisasi, gambar ke canvas
      const renderCard = (svgEl, colIdx, rowIdx, title) => new Promise((resolve) => {
        const x = PAD + colIdx * (CARD_W + PAD)
        const y = HDR_H + PAD + rowIdx * (CARD_H + PAD)

        // Card background
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(0,0,0,0.08)'
        ctx.shadowBlur = 12
        ctx.shadowOffsetY = 2
        ctx.beginPath()
        ctx.roundRect(x, y, CARD_W, CARD_H, 12)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        // Judul chart
        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 13px system-ui, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(title, x + 16, y + 22)

        if (!svgEl) { resolve(); return }

        // Clone SVG dan set dimensi eksplisit agar bisa di-render
        const clone = svgEl.cloneNode(true)
        const svgW = CARD_W - 16
        const svgH = CARD_H - 36
        clone.setAttribute('width', svgW)
        clone.setAttribute('height', svgH)
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

        // Tambahkan font fallback di dalam SVG
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
        style.textContent = 'text { font-family: system-ui, sans-serif; }'
        clone.insertBefore(style, clone.firstChild)

        const serialized = new XMLSerializer().serializeToString(clone)
        // Encode ke base64 agar aman sebagai data URL (hindari charset issue)
        const b64 = btoa(unescape(encodeURIComponent(serialized)))
        const url = `data:image/svg+xml;base64,${b64}`

        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, x + 8, y + 30, svgW, svgH)
          resolve()
        }
        img.onerror = () => {
          // Fallback teks jika SVG gagal render
          ctx.fillStyle = '#9ca3af'
          ctx.font = '12px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('Chart tidak dapat dirender', x + CARD_W / 2, y + CARD_H / 2)
          resolve()
        }
        img.src = url
      })

      const promises = Array.from(cardEls).map((cardEl, i) => {
        const svgEl = cardEl.querySelector('svg')
        const title = charts[i]?.judul || ''
        const col = i % COLS
        const row = Math.floor(i / COLS)
        return renderCard(svgEl, col, row, title)
      })

      await Promise.all(promises)

      const url = canvas.toDataURL('image/png', 1.0)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(judulGrafis || 'laporan-grafis').replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      addToast('Grafis berhasil diunduh sebagai PNG!', 'success')
    } catch (err) {
      console.error('Download PNG error:', err)
      addToast('Gagal download PNG: ' + (err?.message || 'Error tidak diketahui'), 'error')
    }
  }

  const loadTemplate = (tmpl) => {
    if (tmpl.tipe === 'formal') {
      const k = tmpl.konfigurasi
      setKolom(k.kolom_data || [])
      setTampilRingkasan(k.tampilkan_ringkasan ?? true)
      setTampilTtd(k.tampilkan_tanda_tangan ?? true)
      setCatatan(k.catatan_kaki || '')
      if (k.filter?.status_kepegawaian) setFilterKep(k.filter.status_kepegawaian)
      setJudulFormal(tmpl.nama)
      setMode('builder-formal')
    } else {
      // Normalisasi chart dari template: pastikan punya field 'opsi'
      const normalizedCharts = (tmpl.konfigurasi.grafik || []).map(c => ({
        ...c,
        opsi: c.opsi || { tampilkan_label: true, tampilkan_angka: true, tampilkan_legenda: true, warna: CHART_COLORS }
      }))
      setCharts(normalizedCharts)
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
      opsi: { tampilkan_label: true, tampilkan_angka: true, tampilkan_legenda: true, warna: CHART_COLORS }
    }])
  }

  const updateChart = (id, key, val) => {
    setCharts(prev => prev.map(c => {
      if (c.id !== id) return c
      const updated = { ...c, [key]: val }
      // Jika ganti tipe/sumber, cek kompatibilitas dan tampilkan warning
      if (key === 'tipe' || key === 'sumber_data') {
        const sumber = key === 'sumber_data' ? val : c.sumber_data
        const tipe = key === 'tipe' ? val : c.tipe
        const msg = getIncompatibleMsg(sumber, tipe)
        if (msg) addToast(`"${c.judul}": ${msg}`, 'warning')
      }
      return updated
    }))
  }

  const updateChartOpsi = (id, key, val) => {
    setCharts(prev => prev.map(c =>
      c.id === id ? { ...c, opsi: { ...c.opsi, [key]: val } } : c
    ))
  }

  const removeChart = (id) => {
    setCharts(prev => prev.filter(c => c.id !== id))
  }

  // ─── Render Chart ────────────────────────────────────
  const renderChart = (chartCfg, data) => {
    if (!data) return <p className="text-gray-400 text-sm text-center py-8">Tidak ada data</p>

    const opsi = chartCfg.opsi || { tampilkan_label: true, tampilkan_angka: true, tampilkan_legenda: true }
    const warna = opsi.warna || CHART_COLORS
    const incompat = getIncompatibleMsg(chartCfg.sumber_data, chartCfg.tipe)

    // Handle empty data — terutama registrasi_bulanan tanpa data di rentang waktu
    const rawLabels = data.labels
    const labelArr = rawLabels
      ? (Array.isArray(rawLabels) ? rawLabels : (rawLabels.toArray ? rawLabels.toArray() : Object.values(rawLabels)))
      : []
    if (labelArr.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <BarChart2 size={28} className="text-gray-300" />
          <p className="text-gray-400 text-sm font-medium">Tidak ada data</p>
          {chartCfg.sumber_data === 'registrasi_bulanan' && (
            <p className="text-gray-400 text-xs text-center max-w-[200px]">
              Tidak ada pendidik yang mendaftar di rentang waktu ini. Coba ubah rentang tanggal.
            </p>
          )}
        </div>
      )
    }

    if (incompat) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <AlertTriangle size={28} className="text-amber-400" />
          <p className="text-amber-600 text-sm text-center font-medium">Grafik tidak kompatibel</p>
          <p className="text-gray-400 text-xs text-center max-w-[200px]">{incompat}</p>
        </div>
      )
    }

    // Normalisasi labels/values (bisa Collection PHP → array/object di JSON)
    const valueArr = data.data
      ? (Array.isArray(data.data) ? data.data : Object.values(data.data))
      : []

    if (chartCfg.tipe === 'pie') {
      const pieData = labelArr.map((l, i) => ({ name: l, value: Number(valueArr[i]) || 0 }))
      const renderCustomLabel = ({ name, percent }) =>
        opsi.tampilkan_label ? `${name} ${opsi.tampilkan_angka ? `(${(percent * 100).toFixed(0)}%)` : ''}` : (opsi.tampilkan_angka ? `${(percent * 100).toFixed(0)}%` : '')

      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={opsi.tampilkan_label || opsi.tampilkan_angka ? renderCustomLabel : false}
              labelLine={opsi.tampilkan_label || opsi.tampilkan_angka}
            >
              {pieData.map((_, i) => <Cell key={i} fill={warna[i % warna.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {opsi.tampilkan_legenda && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (chartCfg.tipe === 'bar') {
      const barData = labelArr.map((l, i) => ({ name: l, nilai: Number(valueArr[i]) || 0 }))
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: opsi.tampilkan_angka ? 20 : 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} hide={!opsi.tampilkan_label} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            {opsi.tampilkan_legenda && <Legend />}
            <Bar dataKey="nilai" radius={[4, 4, 0, 0]}>
              {barData.map((_, i) => <Cell key={i} fill={warna[i % warna.length]} />)}
              {opsi.tampilkan_angka && <LabelList dataKey="nilai" position="top" style={{ fontSize: 11, fill: '#6b7280' }} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (chartCfg.tipe === 'line') {
      const lineData = labelArr.map((l, i) => ({ name: l, nilai: Number(valueArr[i]) || 0 }))
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData} margin={{ top: opsi.tampilkan_angka ? 20 : 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} hide={!opsi.tampilkan_label} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            {opsi.tampilkan_legenda && <Legend />}
            <Line
              type="monotone"
              dataKey="nilai"
              stroke={warna[0]}
              strokeWidth={2}
              dot={{ r: 4, fill: warna[0] }}
              label={opsi.tampilkan_angka ? { position: 'top', style: { fontSize: 11, fill: '#6b7280' } } : false}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }
  }

  // ─── Toast Container ──────────────────────────────────
  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )

  // ─── HOME ─────────────────────────────────────────────
  if (mode === 'home') return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
          <p className="text-sm text-gray-400 mt-1">Buat laporan formal atau visualisasi data secara kustom.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setMode('builder-formal')}
            className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#1a4a6b]/20">
            <div className="w-12 h-12 bg-[#1a4a6b] rounded-xl flex items-center justify-center mb-4">
              <FileText size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Laporan Formal</h3>
            <p className="text-sm text-gray-400">Buat laporan tabel resmi yang bisa diunduh sebagai PDF.</p>
            <div className="flex items-center gap-1 text-[#1a4a6b] text-sm font-medium mt-4">
              Buat Sekarang <ChevronRight size={14} />
            </div>
          </button>

          <button onClick={() => setMode('builder-grafis')}
            className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-amber-200">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
              <BarChart2 size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Laporan Grafis</h3>
            <p className="text-sm text-gray-400">Buat visualisasi data interaktif dengan berbagai jenis grafik.</p>
            <div className="flex items-center gap-1 text-amber-500 text-sm font-medium mt-4">
              Buat Sekarang <ChevronRight size={14} />
            </div>
          </button>
        </div>

        {/* Template */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Template Siap Pakai</h3>
          {templates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Memuat template...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {templates.map(tmpl => (
                <button key={tmpl.id} onClick={() => loadTemplate(tmpl)}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl text-left hover:border-[#1a4a6b]/40 hover:bg-[#1a4a6b]/5 transition-all">
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
          )}
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
    </>
  )

  // ─── BUILDER FORMAL ───────────────────────────────────
  if (mode === 'builder-formal') return (
    <>
      <ToastContainer />
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('home')} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Builder Laporan Formal</h1>
            <p className="text-sm text-gray-400">Kustomisasi laporan sesuai kebutuhan</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
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

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Opsi Tampilan</label>
            <div className="space-y-2">
              {[
                { label: 'Tampilkan ringkasan statistik', val: tampilRingkasan, set: setTampilRingkasan },
                { label: 'Tampilkan kolom tanda tangan', val: tampilTtd, set: setTampilTtd },
              ].map((opt, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={opt.val} onChange={e => opt.set(e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-600">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Catatan Kaki</label>
            <input value={catatan} onChange={e => setCatatan(e.target.value)}
              placeholder="contoh: Dicetak oleh sistem SIMDIK"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a6b]/20" />
          </div>
        </div>

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
    </>
  )

  // ─── BUILDER GRAFIS ───────────────────────────────────
  if (mode === 'builder-grafis') return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('home')} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
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

          <div className="grid grid-cols-2 gap-4">
            {charts.map(chart => {
              const incompatMsg = getIncompatibleMsg(chart.sumber_data, chart.tipe)
              const opsi = chart.opsi || { tampilkan_label: true, tampilkan_angka: true, tampilkan_legenda: true }

              return (
                <div key={chart.id} className={`border rounded-2xl p-4 space-y-3 ${incompatMsg ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'}`}>
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <input value={chart.judul} onChange={e => updateChart(chart.id, 'judul', e.target.value)}
                      className="font-semibold text-gray-800 text-sm bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-[#1a4a6b] w-full mr-2" />
                    <button onClick={() => removeChart(chart.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Tipe & Sumber */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tipe Chart</p>
                      <select value={chart.tipe} onChange={e => updateChart(chart.id, 'tipe', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                        {TIPE_CHART.map(t => (
                          <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Sumber Data</p>
                      <select value={chart.sumber_data} onChange={e => updateChart(chart.id, 'sumber_data', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                        {SUMBER_CHART.map(s => (
                          <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Peringatan Inkompatibel */}
                  {incompatMsg && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{incompatMsg}</p>
                    </div>
                  )}

                  {/* Rentang waktu untuk registrasi_bulanan */}
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

                  {/* Opsi Tampilan */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><Settings2 size={11} /> Opsi Tampilan</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateChartOpsi(chart.id, 'tampilkan_label', !opsi.tampilkan_label)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                          ${opsi.tampilkan_label ? 'bg-[#1a4a6b] text-white border-[#1a4a6b]' : 'bg-white text-gray-500 border-gray-200'}`}>
                        <Type size={10} />
                        {opsi.tampilkan_label ? <Eye size={10} /> : <EyeOff size={10} />}
                        Nama
                      </button>
                      <button
                        onClick={() => updateChartOpsi(chart.id, 'tampilkan_angka', !opsi.tampilkan_angka)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                          ${opsi.tampilkan_angka ? 'bg-[#1a4a6b] text-white border-[#1a4a6b]' : 'bg-white text-gray-500 border-gray-200'}`}>
                        <Hash size={10} />
                        {opsi.tampilkan_angka ? <Eye size={10} /> : <EyeOff size={10} />}
                        Angka
                      </button>
                      <button
                        onClick={() => updateChartOpsi(chart.id, 'tampilkan_legenda', !opsi.tampilkan_legenda)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                          ${opsi.tampilkan_legenda ? 'bg-[#1a4a6b] text-white border-[#1a4a6b]' : 'bg-white text-gray-500 border-gray-200'}`}>
                        <Palette size={10} />
                        {opsi.tampilkan_legenda ? <Eye size={10} /> : <EyeOff size={10} />}
                        Legenda
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

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
    </>
  )

  // ─── PREVIEW FORMAL ───────────────────────────────────
  if (mode === 'preview' && previewData) return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('builder-formal')} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
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
                <span key={k} className="text-xs bg-[#1a4a6b]/10 text-[#1a4a6b] px-2 py-1 rounded-lg">{k}: {v}</span>
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
    </>
  )

  // ─── PREVIEW GRAFIS ───────────────────────────────────
  if (mode === 'preview-grafis' && chartData) return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('builder-grafis')} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{judulGrafis || 'Laporan Grafis'}</h1>
              <p className="text-xs text-gray-400 mt-0.5">Preview hasil generate grafis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setChartData(null); handlePreviewGrafis() }} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-60">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Regenerate
            </button>
            <button onClick={handleDownloadPNG}
              className="flex items-center gap-2 bg-[#1a4a6b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15395a]">
              <Image size={15} /> Download PNG
            </button>
          </div>
        </div>

        <div ref={chartContainerRef} className="grid grid-cols-2 gap-4 bg-gray-50 p-2 rounded-2xl">
          {charts.map((chartCfg, i) => {
            const data = chartData[i]
            const incompatMsg = getIncompatibleMsg(chartCfg.sumber_data, chartCfg.tipe)

            return (
              <div key={chartCfg.id} data-chart-card className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{chartCfg.judul}</h3>
                  {incompatMsg && (
                    <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <AlertTriangle size={10} /> Tidak Kompatibel
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {SUMBER_CHART.find(s => s.key === chartCfg.sumber_data)?.label} · {TIPE_CHART.find(t => t.key === chartCfg.tipe)?.label}
                </p>
                {renderChart(chartCfg, data)}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Grafis diunduh sebagai PNG — semua chart akan tersimpan dalam satu gambar.
        </p>
      </div>
    </>
  )

  return null
}