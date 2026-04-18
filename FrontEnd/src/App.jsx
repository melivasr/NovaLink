import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CatalogPage from './pages/CatalogPage'
import OrdersPage from './pages/OrdersPage'
import NotificationsPage from './pages/NotificationsPage'

function Layout() {
  const location = useLocation()
  const hideNavbar = ['/', '/register'].includes(location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
