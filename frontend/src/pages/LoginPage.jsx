import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { MapPin, ShieldCheck, AlertCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

const LoginPage = () => {
  const navigate = useNavigate()
  const { loginWithGoogle, loading } = useAuth()
  const [params] = useSearchParams()
  const pendingApproval = params.get('pending') === '1'

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState('driver')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGoogle = async () => {
    setIsLoading(true)
    const result = await loginWithGoogle(role)
    setIsLoading(false)
    if (result.success) navigate(result.redirectPath)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Drivers and admins sign in with Google. Admins must approve drivers.
          </p>
          {pendingApproval && (
            <div className="mx-auto mt-3 flex max-w-sm items-center gap-2 rounded-md border bg-card p-2 text-left text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span>Your driver access is pending admin approval.</span>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="role">Sign in as</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGoogle} className="w-full" disabled={isLoading || loading}>
                {isLoading || loading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            </div>
            <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Admins can access Admin Panel directly after sign‑in.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Drivers must be approved by Admin before accessing Driver Console.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
