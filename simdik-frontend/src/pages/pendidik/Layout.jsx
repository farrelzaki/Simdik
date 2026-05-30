import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Bell, Settings, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../lib/axios'

const menus = [
  { to: '/pendidik/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/pendidik/profil',      icon: FileText,        label: 'Profil'       },
  { to: '/pendidik/dokumen',     icon: FileText,        label: 'Dokumen'      },
  { to: '/pendidik/notifikasi',  icon: Bell,            label: 'Notifikasi'   },
  { to: '/pendidik/pengaturan',  icon: Settings,        label: 'Pengaturan'   },
]

export default function PendidikLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [belumDibaca, setBelumDibaca] = useState(0)

  useEffect(() => {
    const fetchCount = () => {
      api.get('/pendidik/notifikasi').then(res => {
        setBelumDibaca(res.data.belum_dibaca || 0)
      }).catch(() => {})
    }
    fetchCount()

    const handleUpdate = (e) => {
      if (e.detail !== undefined) {
        setBelumDibaca(e.detail)
      } else {
        fetchCount()
      }
    }
    window.addEventListener('updateNotifPendidik', handleUpdate)
    return () => window.removeEventListener('updateNotifPendidik', handleUpdate)
  }, [])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } finally {
      localStorage.clear()
      navigate('/login')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#e6eff2]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#054a5c] flex flex-col fixed top-0 left-0 bottom-0 z-50">
        {/* Brand */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#054a5c" />
              <path d="M35 40 Q50 25 65 40 L65 65 Q50 75 35 65 Z" fill="#e8a020" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Ihsan Tauhid</p>
            <p className="text-[#a5c6cf] text-xs">Management System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menus.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-white/15 text-white' : 'text-[#c0d8de] hover:bg-white/5 hover:text-white'}`
              }>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#c0d8de] hover:bg-white/5 hover:text-white w-full transition-all">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-end gap-6 sticky top-0 z-10">
          <button onClick={() => navigate('/pendidik/notifikasi')}
            className="relative text-[#054a5c] hover:text-[#033a47]">
            <Bell size={20} />
            {belumDibaca > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {belumDibaca > 9 ? '9+' : belumDibaca}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#054a5c]">{user.nama || 'Pendidik'}</p>
              <p className="text-xs text-gray-400">NIP: {user.nik || '—'}</p>
            </div>
            <div className="w-9 h-9 bg-[#054a5c] rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.nama ? user.nama[0] : 'P'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}