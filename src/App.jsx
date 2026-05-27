import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Destinations from './pages/Destinations'
import DestinationDetail from './pages/DestinationDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import BookTransport from './pages/BookTransport'
import BikeRides from './pages/BikeRides'
import Hotels from './pages/Hotels'
import HotelDetail from './pages/HotelDetail'
import MapRoute from './pages/MapRoute'
import Gallery from './pages/Gallery'
import Feedback from './pages/Feedback'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Admin from './pages/admin/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/:id" element={<DestinationDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="book" element={<BookTransport />} />
            <Route path="bike-rides" element={<BikeRides />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="hotels/:id" element={<HotelDetail />} />
            <Route path="map" element={<MapRoute />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="contact" element={<Contact />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
