import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { MapPin, CheckCircle, AlertTriangle, ClipboardCheck, Wrench } from 'lucide-react'
import {Link} from 'react-router-dom'


const OfficialDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Official Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">Assigned</Badge>
              <Button variant="outline">
                <Link to="/map">
                View Map
                </Link>
                
                </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">24</div>
              <p className="text-xs text-gray-500">Awaiting action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">12</div>
              <p className="text-xs text-gray-500">Currently being resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Resolved This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">18</div>
              <p className="text-xs text-gray-500">Great job!</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> My Assigned Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 border rounded-md bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                  Assigned issues list placeholder
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-md bg-amber-50 text-amber-800 text-sm">High severity issue reported in Sector 12</div>
              <div className="p-3 border rounded-md bg-amber-50 text-amber-800 text-sm">New report awaiting acknowledgment</div>
              <div className="p-3 border rounded-md bg-amber-50 text-amber-800 text-sm">Follow-up required for two cases</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OfficialDashboard


