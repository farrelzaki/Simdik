import { Search, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../lib/axios'

export default function Topbar() {
  const navigate = useNavigate()
  const [belumDibaca, setBelumDibaca] = useState(0)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchCount = () => {
    api.get('/admin/notifikasi').then(res => {
      setBelumDibaca(res.data.belum_dibaca || 0)
    }).catch(() => {})
  }

  useEffect(() => {
    fetchCount()
    
    const handleUpdate = (e) => {
      if (e.detail !== undefined) {
        setBelumDibaca(e.detail)
      } else {
        fetchCount()
      }
    }
    
    window.addEventListener('updateNotifAdmin', handleUpdate)
    return () => window.removeEventListener('updateNotifAdmin', handleUpdate)
  }, [])

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search data or reports..."
          className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#0f2a3f]/20"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Bell */}
        <button
          onClick={() => navigate('/admin/notifikasi')}
          className="relative p-1.5 hover:bg-gray-100 rounded-lg"
        >
          <Bell size={18} className="text-gray-600" />
          {belumDibaca > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {belumDibaca > 9 ? '9+' : belumDibaca}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">Administrator</p>
            <p className="text-xs text-gray-400">NIP: {user.nip || '—'}</p>
          </div>
          <div className="w-8 h-8 bg-[#0f2a3f] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user.nama ? user.nama[0] : 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}