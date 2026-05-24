import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { GraduationCap, Users, Building2, UserPlus, Download, Calendar, MoreVertical } from 'lucide-react'
import api from '../../lib/axios'

const STATUS_COLORS = {
  VERIFIED:  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PENDING:   { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  'ON REVIEW':{ bg: 'bg-blue-100',   text: 'text-blue-700'    },
  DITOLAK:   { bg: 'bg-red-100',     text: 'text-red-700'     },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Data dummy sementara sebelum backend tersambung
  const barData = [
    { unit: 'Unit SD',  Guru: 38, Tendik: 8  },
    { unit: 'Unit SMP', Guru: 42, Tendik: 10 },
    { unit: 'Unit SMA', Guru: 35, Tendik: 7  },
    { unit: 'Unit SMK', Guru: 27, Tendik: 6  },
  ]

  const pieData = [
    { name: 'Laki-laki',  value: stats?.statistik ? 78 : 78, color: '#1a4a6b' },
    { name: 'Perempuan',  value: stats?.statistik ? 64 : 64, color: '#90b8d0' },
  ]

  const totalGender = pieData.reduce((a, b) => a + b.value, 0)

  const registrasiTerbaru = [
    { nama: 'Ahmad Maulana, S.Pd', id: '202300412', unit: 'SMA Ihsan Tauhid', posisi: 'Guru Matematika',  status: 'VERIFIED'   },
    { nama: 'Siti Fatimah, M.Pd',  id: '202300415', unit: 'SD Ihsan Tauhid',  posisi: 'Wali Kelas 4',    status: 'PENDING'    },
    { nama: 'Rudi Hermawan',        id: '202300418', unit: 'Yayasan / Pusat',  posisi: 'Staff IT',         status: 'ON REVIEW'  },
  ]

  const statCards = [
    {
      icon: GraduationCap,
      label: 'Total Guru',
      value: stats?.statistik?.total_pendidik ?? 142,
      sub: 'Aktif mengajar semester ini',
      badge: '+12%',
      badgeColor: 'text-emerald-600',
    },
    {
      icon: Users,
      label: 'Tenaga Pendidik',
      value: 128,
      sub: 'Sertifikasi & Non-Sertifikasi',
      badge: '+5%',
      badgeColor: 'text-emerald-600',
    },
    {
      icon: Building2,
      label: 'Tenaga Kependidikan',
      value: 14,
      sub: 'Staf TU & Operasional',
      badge: 'Stable',
      badgeColor: 'text-gray-500',
    },
    {
      icon: UserPlus,
      label: 'Registrasi Baru',
      value: stats?.statistik?.total_pending ?? 28,
      sub: 'Pending verifikasi berkas',
      badge: null,
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Memuat data...
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Statistik Yayasan</h1>
          <p className="text-sm text-gray-400 mt-1">Ringkasan data tenaga pendidik dan kependidikan terpusat.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Calendar size={15} />
            Akademik 2023/2024
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1a4a6b] text-white rounded-xl text-sm hover:bg-[#15395a]">
            <Download size={15} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <card.icon size={18} className="text-gray-600" />
              </div>
              {card.badge && (
                <span className={`text-xs font-medium ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Distribusi Jenjang Pendidikan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Perbandingan jumlah personil per tingkat sekolah</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1a4a6b] inline-block" />
                Guru
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#90b8d0] inline-block" />
                Tendik
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4}>
              <XAxis dataKey="unit" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="Guru"   fill="#1a4a6b" radius={[4,4,0,0]} />
              <Bar dataKey="Tendik" fill="#90b8d0" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Gender Profil</h3>
          <div className="flex flex-col items-center">
            <div className="relative">
              <PieChart width={140} height={140}>
                <Pie
                  data={pieData}
                  cx={65} cy={65}
                  innerRadius={45}
                  outerRadius={65}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-bold text-gray-800">{totalGender}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
              </div>
            </div>
            <div className="w-full space-y-2 mt-4">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-700">
                    {item.value} ({Math.round(item.value / totalGender * 100)}%)
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full border border-gray-200 text-gray-600 text-xs py-2 rounded-xl hover:bg-gray-50">
              Detail Profil Personil
            </button>
          </div>
        </div>
      </div>

      {/* Registrasi Terbaru */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Registrasi Terbaru</h3>
          <button
            onClick={() => navigate('/admin/registrasi')}
            className="text-sm text-[#1a4a6b] font-medium hover:underline"
          >
            Lihat Semua →
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left pb-3 font-medium">Nama Lengkap</th>
              <th className="text-left pb-3 font-medium">Unit/Tujuan</th>
              <th className="text-left pb-3 font-medium">Posisi</th>
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-left pb-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {registrasiTerbaru.map((row, i) => {
              const colors = STATUS_COLORS[row.status] || STATUS_COLORS['PENDING']
              return (
                <tr key={i} className="text-sm">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1a4a6b] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {row.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{row.nama}</p>
                        <p className="text-xs text-gray-400">ID: {row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">{row.unit}</td>
                  <td className="py-3 text-gray-600">{row.posisi}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}