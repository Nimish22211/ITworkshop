import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { MapPin, CheckCircle, AlertTriangle, ClipboardCheck, Wrench, Eye, Edit, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const OfficialDashboard = () => {
  const { user } = useAuth()
  const { fetchAssignedIssues, fetchOfficialStats, updateIssueStatus, loading } = useIssues()
  const [assignedIssues, setAssignedIssues] = useState([])
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolvedThisWeek: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const loadOfficialData = async () => {
      if (user?.id) {
        try {
          const [issues, officialStats] = await Promise.all([
            fetchAssignedIssues(user.id),
            fetchOfficialStats(user.id)
          ])
          setAssignedIssues(issues)
          setStats(officialStats)
        } catch (error) {
          console.error('Error loading official data:', error)
        } finally {
          setLoadingStats(false)
        }
      }
    }
    loadOfficialData()
  }, [user?.id])

  const handleStatusUpdate = async (issueId, newStatus) => {
    const result = await updateIssueStatus(issueId, newStatus)
    if (result.success) {
      // Refresh the assigned issues
      const updatedIssues = await fetchAssignedIssues(user.id)
      setAssignedIssues(updatedIssues)
      
      // Refresh stats
      const updatedStats = await fetchOfficialStats(user.id)
      setStats(updatedStats)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      reported: 'bg-red-100 text-red-800',
      acknowledged: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      verified: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getSeverityColor = (severity) => {
    if (severity >= 4) return 'text-red-600'
    if (severity >= 3) return 'text-orange-600'
    return 'text-yellow-600'
  }

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
              <div className="text-3xl font-semibold">{loadingStats ? '—' : stats.pending}</div>
              <p className="text-xs text-gray-500">Awaiting action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{loadingStats ? '—' : stats.inProgress}</div>
              <p className="text-xs text-gray-500">Currently being resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Resolved This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{loadingStats ? '—' : stats.resolvedThisWeek}</div>
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
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">Loading assigned issues...</div>
                    </div>
                  ) : assignedIssues.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">No issues assigned to you yet</div>
                    </div>
                  ) : (
                    assignedIssues.map((issue) => (
                      <div key={issue.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm">{issue.title}</h4>
                              <Badge className={getStatusColor(issue.status)}>
                                {issue.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{issue.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {issue.address || 'Location not specified'}
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className={`h-3 w-3 ${getSeverityColor(issue.severity)}`} />
                                Severity: {issue.severity}/5
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(issue.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {issue.status === 'acknowledged' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(issue.id, 'in_progress')}
                                className="text-xs"
                              >
                                Start Work
                              </Button>
                            )}
                            {issue.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(issue.id, 'resolved')}
                                className="text-xs bg-green-600 hover:bg-green-700"
                              >
                                Mark Resolved
                              </Button>
                            )}
                            <Link to={`/issue/${issue.id}`}>
                              <Button size="sm" variant="outline" className="text-xs w-full">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedIssues.filter(issue => issue.severity >= 4 || issue.status === 'reported').length === 0 ? (
                <div className="p-3 border rounded-md bg-green-50 text-green-800 text-sm">
                  No urgent alerts at this time
                </div>
              ) : (
                assignedIssues
                  .filter(issue => issue.severity >= 4 || issue.status === 'reported')
                  .slice(0, 3)
                  .map((issue) => (
                    <div key={issue.id} className="p-3 border rounded-md bg-amber-50 text-amber-800 text-sm">
                      {issue.severity >= 4 ? 'High severity: ' : 'New report: '}
                      {issue.title}
                      {issue.address && ` in ${issue.address}`}
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OfficialDashboard


