import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { IssueProvider } from './context/IssueContext'
import { Toaster } from 'react-hot-toast'

// Pages
import HomePage from './pages/HomePage'
import ReportIssuePage from './pages/ReportIssuePage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Landing from './pages/Landing'
import IssueDetailsPage from './pages/IssueDetailsPage'

// Components
import Header from './components/Common/Header'
import ProtectedRoute from './components/Common/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <IssueProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Routes>
                <Route path="/home" element={<Landing />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/report" element={<ReportIssuePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/issue/:id" element={<IssueDetailsPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
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
      </IssueProvider>
    </AuthProvider>
  )
}

export default App
