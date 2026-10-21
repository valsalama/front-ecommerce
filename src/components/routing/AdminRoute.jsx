import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function AdminRoute() {
  const { access, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (access !== 'ADMIN') {
    return <Navigate to="/sin-permiso" replace />
  }

  return <Outlet />
}

export default AdminRoute
