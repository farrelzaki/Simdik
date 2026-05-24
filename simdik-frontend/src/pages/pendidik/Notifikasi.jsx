import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Filter, AlertCircle, FileText, RefreshCw, Megaphone, Briefcase } from 'lucide-react'
import api from '../../lib/axios'

const TIPE_ICON = {
  error:   { icon: AlertCircle, bg: 'bg-red-100',    text: 'text-red-500'    },
  success: { icon: FileText,    bg: 'bg-blue-100',    text: 'text-blue-500'   },
  info:    { icon: RefreshCw,   bg: 'bg-gray-100',    text: 'text-gray-500'   },
  warning: { icon: Briefcase,   bg: 'bg-amber-100',   text: 'text-amber-500'  },
  promo:   { icon: Megaphone,   bg: 'bg-purple-100',  text: 'text-purple-500' },
}

const formatWaktu = (dateStr) => {
  const now  = new Date()
  const date = new Date(dateStr)
  const diff = now - date
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hrs < 1)    return 'Baru saja'
  if (hrs < 24)   return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
  if (days === 1) return `Kemarin, ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
  return `${days} Hari Lalu`
}

const groupByWaktu = (items) => {
  const groups = { 'HARI INI': [], 'KEMARIN': [], 'MINGGU LALU': [] }
  const now = new Date()
  items.forEach(item => {
    const diff = Math.floor((now - new Date(item.created_at)) / 86400000)
    if (diff === 0)      groups['HARI INI'].push(item)
    else if (diff === 1) groups['KEMARIN'].push(item)
    else                 groups['MINGGU LALU'].push(item)
  })
  return groups
}

export default function PendidikNotifikasi() {
  const [notifikasi, setNotifikasi] = useState([])
  const [loading, setLoading]       = useState(true)
  const [marking, setMarking]       = useState(false)

  const fetchNotifikasi = () => {
    api.get('/pendidik/notifikasi')
      .then(res => setNotifikasi(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifikasi() }, [])

  const tandaiSemuaDibaca = async () => {
    setMarking(true)
    try {
      await api.patch('/pendidik/notifikasi/baca-semua')
      setNotifikasi(prev => prev.map(n => ({ ...n, dibaca: true })))
    } catch {
    } finally {
      setMarking(false)
    }
  }

  const tandaiDibaca = async (id) => {
    try {
      await api.patch(`/pendidik/notifikasi/${id}/baca`)
      setNotifikasi(prev => prev.map(n =>
        n.id_notifikasi === id ? { ...n, dibaca: true } : n
      ))
    } catch {}
  }

  const belumDibaca = notifikasi.filter(n => !n.dibaca).length
  const groups      = groupByWaktu(notifikasi)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#054a5c]">Pusat Notifikasi</h1>
          <p className="text-sm text-gray-400 mt-1">Pantau pembaruan dokumen dan aktivitas sistem Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> Filter
          </button>
          <button onClick={tandaiSemuaDibaca}
            disabled={marking || belumDibaca === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#054a5c] text-white rounded-xl text-sm hover:bg-[#033a47] disabled:opacity-60">
            <CheckCheck size={14} />
            {marking ? 'Memproses...' : 'Tandai Semua Dibaca'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-sm text-gray-400 py-12">Memuat notifikasi...</p>
      ) : notifikasi.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Bell size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Tidak ada notifikasi</p>
        </div>
      ) : (
        Object.entries(groups).map(([group, items]) => {
          if (items.length === 0) return null
          return (
            <div key={group}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{group}</p>
              <div className="space-y-2">
                {items.map(item => {
                  const tipe = TIPE_ICON[item.tipe] || TIPE_ICON.info
                  const Icon = tipe.icon
                  return (
                    <div key={item.id_notifikasi}
                      onClick={() => !item.dibaca && tandaiDibaca(item.id_notifikasi)}
                      className={`bg-white rounded-2xl shadow-sm p-5 flex gap-4 cursor-pointer hover:shadow-md transition-shadow
                        ${!item.dibaca ? 'border-l-4 border-[#054a5c]' : ''}`}>
                      <div className={`w-10 h-10 rounded-full ${tipe.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={tipe.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800">{item.judul}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400">{formatWaktu(item.created_at)}</span>
                            {!item.dibaca && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{item.pesan}</p>
                        {item.link && (
                          <div className="flex gap-2 mt-3">
                            <a href={item.link}
                              className="px-3 py-1.5 bg-[#054a5c] text-white text-xs rounded-lg hover:bg-[#033a47]">
                              Lihat Detail
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}

      {notifikasi.length > 0 && (
        <div className="text-center">
          <button className="text-sm text-[#054a5c] font-medium hover:underline">
            Tampilkan Lebih Banyak
          </button>
        </div>
      )}
    </div>
  )
}