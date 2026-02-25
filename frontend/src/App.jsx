import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import AdminLayout from './components/AdminLayout'
import AdminRoute from './components/AdminRoute'
import HomePage from './pages/user/HomePage'
import ProductDetailPage from './pages/user/ProductDetailPage'
import CartPage from './pages/user/CartPage'
import CheckoutPage from './pages/user/CheckoutPage'
import OrderConfirmationPage from './pages/user/OrderConfirmationPage'
import OrdersPage from './pages/user/OrdersPage'
import RegisterPage from './pages/user/RegisterPage'
import LoginPage from './pages/user/LoginPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminAddProduct from './pages/admin/AdminAddProduct'
import AdminEditProduct from './pages/admin/AdminEditProduct'
import AdminOrders from './pages/admin/AdminOrders'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminCategories from './pages/admin/AdminCategories'

// Protected user route — redirects to /login instead of /admin/login
const UserRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const UserPageLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public user routes */}
            <Route path="/" element={<UserPageLayout><HomePage /></UserPageLayout>} />
            <Route path="/product/:id" element={<UserPageLayout><ProductDetailPage /></UserPageLayout>} />
            <Route path="/cart" element={<UserPageLayout><CartPage /></UserPageLayout>} />
            <Route path="/register" element={<UserPageLayout><RegisterPage /></UserPageLayout>} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected user routes */}
            <Route path="/checkout" element={<UserRoute><UserPageLayout><CheckoutPage /></UserPageLayout></UserRoute>} />
            <Route path="/order-confirmation/:id" element={<UserRoute><UserPageLayout><OrderConfirmationPage /></UserPageLayout></UserRoute>} />
            <Route path="/orders" element={<UserRoute><UserPageLayout><OrdersPage /></UserPageLayout></UserRoute>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<AdminAddProduct />} />
              <Route path="products/edit/:id" element={<AdminEditProduct />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App