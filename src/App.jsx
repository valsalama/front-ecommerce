import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import AdminRoute from './components/routing/AdminRoute'
import ProtectedRoute from './components/routing/ProtectedRoute'
import AccessDeniedPage from './pages/AccessDeniedPage'
import AdminProductsPage from './pages/AdminProductsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryDetailPage from './pages/CategoryDetailPage'
import CategoryFormPage from './pages/CategoryFormPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'
import ProductPhotosPage from './pages/ProductPhotosPage'
import ProductReviewsPage from './pages/ProductReviewsPage'
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
        <Route path="productos" element={<ProductListPage />} />
        <Route path="productos/:id" element={<ProductDetailPage />} />
        <Route
          path="productos/:productoId/resenias"
          element={<ProductReviewsPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="mi-perfil" element={<UserDetailPage ownProfile />} />
          <Route path="usuarios/:id" element={<UserDetailPage />} />
          <Route path="carrito" element={<CartPage />} />
          <Route path="favoritos" element={<FavoritesPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="ordenes" element={<OrdersPage />} />
          <Route path="ordenes/:ordenId" element={<OrderDetailPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="admin/productos" element={<AdminProductsPage />} />
          <Route path="admin/productos/:id/fotos" element={<ProductPhotosPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="categorias/nueva" element={<CategoryFormPage />} />
          <Route path="categorias/:id" element={<CategoryDetailPage />} />
          <Route path="categorias/:id/editar" element={<CategoryFormPage />} />
        </Route>

        <Route path="sin-permiso" element={<AccessDeniedPage />} />
        <Route path="inicio" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
