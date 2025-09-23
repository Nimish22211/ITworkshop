import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  BarChart3, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users,
  TrendingUp,
  Filter
} from 'lucide-react'
import { formatDate, getStatusColor } from '../utils/helpers'
import { ISSUE_STATUSES } from '../utils/constants'

const DashboardPage = () => {
  const { user } = useAuth()
  const { 
    issues, 
    loading, 
    analytics, 
    fetchIssues, 
    fetchAnalytics, 
    updateIssueStatus,
    assignIssue 
  } = useIssues()
  
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState(null)

  useEffect(() => {
    fetchIssues({ assigned_to: user?.role === 'official' ? user.id : null })
    if (user?.role === 'admin') {
      fetchAnalytics()
    }
  }, [user])

  const handleStatusUpdate = async (issueId, newStatus, internalNotes = null) => {
    try {
      await updateIssueStatus(issueId, newStatus, internalNotes)
      setSelectedIssue(null)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleAssignIssue = async (issueId, officialId) => {
    try {
      await assignIssue(issueId, officialId)
    } catch (error) {
      console.error('Error assigning issue:', error)
    }
  }

  const filteredIssues = selectedStatus === 'all' 
    ? issues 
    : issues.filter(issue => issue.status === selectedStatus)

  const isAdmin = user?.role === 'admin'
  const isOfficial = user?.role === 'official'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  {ISSUE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Analytics Cards */}
        {isAdmin && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalIssues}</div>
                <p className="text-xs text-muted-foreground">
                  All reported issues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.resolvedIssues}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.avgResolutionTime ? 
                    `${Math.round(analytics.avgResolutionTime)}h` : 
                    'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Average time to resolve
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalIssues > 0 ? 
                    `${Math.round((analytics.resolvedIssues / analytics.totalIssues) * 100)}%` : 
                    '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Issues resolved
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Issues List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {isAdmin ? 'All Issues' : 'My Assigned Issues'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{issue.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {issue.description.length > 100 
                              ? `${issue.description.substring(0, 100)}...` 
                              : issue.description
                            }
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{issue.category}</span>
                            <span>•</span>
                            <span>Severity: {issue.severity}/5</span>
                            <span>•</span>
                            <span>{formatDate(issue.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No issues found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Issue Details Sidebar */}
          {selectedIssue && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedIssue.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedIssue.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge className={getStatusColor(selectedIssue.status)}>
                        {selectedIssue.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Category:</span>
                      <span className="text-sm">{selectedIssue.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Severity:</span>
                      <span className="text-sm">{selectedIssue.severity}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Reported:</span>
                      <span className="text-sm">{formatDate(selectedIssue.created_at)}</span>
                    </div>
                  </div>

                  {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Photos</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedIssue.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo.url}
                            alt={`Issue photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update Actions */}
                  {(isOfficial || isAdmin) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Update Status</h4>
                      <div className="space-y-2">
                        {ISSUE_STATUSES.map((status) => (
                          <Button
                            key={status.value}
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(selectedIssue.id, status.value)}
                            className="w-full justify-start"
                            disabled={selectedIssue.status === status.value}
                          >
                            {status.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setSelectedIssue(null)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
