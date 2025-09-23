import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { AlertCircle, Clock, Network, Cpu, BarChart3, Database, Shield } from 'lucide-react'
import { mockApi } from '../services/mockApi'

const StatCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">Updated just now</p>
    </CardContent>
  </Card>
)

const AdminDashboard = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await mockApi.getAdminMetrics()
        setMetrics(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">LIVE</Badge>
              <Button variant="outline">Sync Data</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Performance Chart remains */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 border rounded-md flex items-center justify-center text-gray-400 text-sm">
                  Chart Placeholder
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Placeholder for other potential admin specific items if needed */}
        </div>

        {/* New Metric Cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Complaints (state-wide)"
            value={loading ? '—' : metrics?.totalComplaints?.toLocaleString()}
            icon={AlertCircle}
          />
          <StatCard
            title="Complaints Resolved %"
            value={loading ? '—' : `${Math.round((metrics.resolvedComplaints / metrics.totalComplaints) * 100)}%`}
            icon={Shield}
          />
          <StatCard
            title="Average Resolution Time (days/hours)"
            value={loading ? '—' : `${Math.floor(metrics.averageResolutionHours / 24)}d ${Math.round(metrics.averageResolutionHours % 24)}h`}
            icon={Clock}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatCard
            title="Complaints Escalated %"
            value={loading ? '—' : `${Math.round((metrics.escalatedComplaints / metrics.totalComplaints) * 100)}%`}
            icon={AlertCircle}
          />
          <StatCard
            title="Total Officials Created (district-level)"
            value={loading ? '—' : metrics?.totalOfficials?.toLocaleString()}
            icon={Database}
          />
          <StatCard
            title="Total Service Men (via officials)"
            value={loading ? '—' : metrics?.totalServiceMen?.toLocaleString()}
            icon={Shield}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard