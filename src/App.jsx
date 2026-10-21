import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import AdminRoute from './components/routing/AdminRoute'
import ProtectedRoute from './components/routing/ProtectedRoute'
import AccessDeniedPage from './pages/AccessDeniedPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import UserDetailPage from './pages/UserDetailPage'
import UsersPage from './pages/UsersPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="mi-perfil" element={<UserDetailPage ownProfile />} />
          <Route path="usuarios/:id" element={<UserDetailPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="usuarios" element={<UsersPage />} />
        </Route>

        <Route path="sin-permiso" element={<AccessDeniedPage />} />
        <Route path="inicio" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
