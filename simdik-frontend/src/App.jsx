import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Pending from './pages/Pending'

// Admin
import AdminLayout from './components/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import DataPendidik from './pages/admin/DataPendidik'
import TambahPendidik from './pages/admin/TambahPendidik'
import EditPendidik from './pages/admin/EditPendidik'
import DataRegistrasi from './pages/admin/DataRegistrasi'
import Laporan from './pages/admin/Laporan'
import AdminNotifikasi from './pages/admin/Notifikasi'
import AdminPengaturan from './pages/admin/Pengaturan'
import PerubahanProfil from './pages/admin/PerubahanProfil'
import HapusAkunRequest from './pages/admin/HapusAkunRequest'

// Pendidik
import PendidikLayout from './pages/pendidik/Layout'
import PendidikDashboard from './pages/pendidik/Dashboard'
import PendidikProfil from './pages/pendidik/Profil'
import PendidikDokumen from './pages/pendidik/Dokumen'
import PendidikNotifikasi from './pages/pendidik/Notifikasi'
import PendidikPengaturan from './pages/pendidik/Pengaturan'

const isAdmin    = () => localStorage.getItem('role') === 'tata_usaha'
const isPendidik = () => localStorage.getItem('role') === 'pendidik'
const isLoggedIn = () => !!localStorage.getItem('token')

function AdminRoute({ children }) {
  if (!isLoggedIn() || !isAdmin()) return <Navigate to="/login" />
  return children
}

function PendidikRoute({ children }) {
  if (!isLoggedIn() || !isPendidik()) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending"  element={<Pending />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index                    element={<Navigate to="dashboard" />} />
          <Route path="dashboard"         element={<Dashboard />} />
          <Route path="pendidik"          element={<DataPendidik />} />
          <Route path="pendidik/tambah"   element={<TambahPendidik />} />
          <Route path="pendidik/:id/edit" element={<EditPendidik />} />
          <Route path="registrasi"        element={<DataRegistrasi />} />
          <Route path="laporan"           element={<Laporan />} />
          <Route path="notifikasi"        element={<AdminNotifikasi />} />
          <Route path="pengaturan"        element={<AdminPengaturan />} />
          <Route path="perubahan-profil" element={<PerubahanProfil />} />
          <Route path="hapus-akun" element={<HapusAkunRequest />} />
        </Route>

        {/* Pendidik */}
        <Route path="/pendidik" element={<PendidikRoute><PendidikLayout /></PendidikRoute>}>
          <Route index                element={<Navigate to="dashboard" />} />
          <Route path="dashboard"     element={<PendidikDashboard />} />
          <Route path="profil"        element={<PendidikProfil />} />
          <Route path="dokumen"       element={<PendidikDokumen />} />
          <Route path="notifikasi"    element={<PendidikNotifikasi />} />
          <Route path="pengaturan"    element={<PendidikPengaturan />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}