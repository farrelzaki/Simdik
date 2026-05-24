import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList,
  BarChart2, Bell, Settings, LogOut, GitPullRequest
} from 'lucide-react'
import api from '../../lib/axios'

const menus = [
  { to: '/admin/dashboard',         icon: LayoutDashboard,  label: 'Dashboard'            },
  { to: '/admin/pendidik',          icon: Users,            label: 'Data Pendidik/Tendik' },
  { to: '/admin/perubahan-profil',  icon: GitPullRequest,   label: 'Review Perubahan'     },
  { to: '/admin/registrasi',        icon: ClipboardList,    label: 'Data Registrasi'      },
  { to: '/admin/laporan',           icon: BarChart2,        label: 'Laporan'              },
  { to: '/admin/notifikasi',        icon: Bell,             label: 'Notifikasi'           },
  { to: '/admin/pengaturan',        icon: Settings,         label: 'Pengaturan'           },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.clear()
      navigate('/login')
    }
  }

  return (
    <aside className="w-56 min-h-screen bg-[#0f2a3f] flex flex-col text-white">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center font-bold text-[#0f2a3f] text-sm">
            IT
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Ihsan Tauhid</p>
            <p className="text-xs text-white/50">Management System</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {menus.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
              ${isActive
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}