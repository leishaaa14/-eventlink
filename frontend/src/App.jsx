import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

import Home           from './pages/Home'
import Login          from './pages/Login'
import Signup         from './pages/Signup'
import Dashboard      from './pages/Dashboard'
import Events         from './pages/Events'
import BookedEvents   from './pages/BookedEvents'
import Payment        from './pages/Payment'
import QRCodes        from './pages/QRCodes'
import AdminDashboard from './pages/AdminDashboard'
import ValidatorPage  from './pages/ValidatorPage'

function PrivateRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/dashboard" />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/signup"    element={<Signup />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/events"    element={<PrivateRoute><Events /></PrivateRoute>} />
      <Route path="/booked"    element={<PrivateRoute><BookedEvents /></PrivateRoute>} />
      <Route path="/payment/:eventId" element={<PrivateRoute><Payment /></PrivateRoute>} />
      <Route path="/qrcodes"   element={<PrivateRoute><QRCodes /></PrivateRoute>} />
      <Route path="/admin"     element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
      <Route path="/validate"  element={<PrivateRoute role="validator"><ValidatorPage /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
