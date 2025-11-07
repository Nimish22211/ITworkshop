import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BusProvider } from './context/BusContext'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'

// Pages
import Landing from './pages/Landing'
import PublicMap from './pages/PublicMap'
import DriverDashboard from './pages/DriverDashboard'
import Admin from './pages/Admin'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <AuthProvider>
      <BusProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <main>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/map" element={<PublicMap />} />
                <Route path="/driver" element={<ProtectedRoute roles={["driver"]}><DriverDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>} />
                <Route path="/login" element={<LoginRouteGuard />} />
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </div>
        </Router>
      </BusProvider>
    </AuthProvider>
  )
}

export default App

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role, approved, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />
  if (roles?.includes('driver') && role === 'driver' && !approved) return <Navigate to="/login?pending=1" replace />
  return children
}

function LoginRouteGuard() {
  const { isAuthenticated, role, approved } = useAuth()
  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'driver') {
      // If driver is not approved yet, show login page with pending notice instead of redirect loop
      if (!approved) return <LoginPage />
      return <Navigate to="/driver" replace />
    }
    return <Navigate to="/map" replace />
  }
  return <LoginPage />
}
