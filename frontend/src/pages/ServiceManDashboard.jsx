import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Hammer, MapPin, ClipboardList, Check } from 'lucide-react'

const ServiceManDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Man Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">On Duty</Badge>
              <Button variant="outline">Start Shift</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Jobs Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">8</div>
              <p className="text-xs text-gray-500">For today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Hammer className="h-5 w-5" /> In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">3</div>
              <p className="text-xs text-gray-500">Working now</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Check className="h-5 w-5" /> Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">5</div>
              <p className="text-xs text-gray-500">Today</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Nearby Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 border rounded-md bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                Map/tasks list placeholder
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">Start Next Job</Button>
              <Button variant="outline" className="justify-start">Update Status</Button>
              <Button variant="outline" className="justify-start">Upload Photo</Button>
              <Button variant="outline" className="justify-start">Report Blocker</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ServiceManDashboard


