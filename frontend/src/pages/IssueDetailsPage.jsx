import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIssues } from '../context/IssueContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Camera,
  MessageSquare
} from 'lucide-react'
import { formatDate, getStatusColor, getSeverityColor } from '../utils/helpers'
import { ISSUE_STATUSES } from '../utils/constants'

const IssueDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedIssue, fetchIssueById, updateIssueStatus } = useIssues()
  
  const [loading, setLoading] = useState(true)
  const [internalNotes, setInternalNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const loadIssue = async () => {
      setLoading(true)
      try {
        await fetchIssueById(id)
      } catch (error) {
        console.error('Error loading issue:', error)
      } finally {
        setLoading(false)
      }
    }

    loadIssue()
  }, [id])

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await updateIssueStatus(id, newStatus, internalNotes)
      setInternalNotes('')
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!selectedIssue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{selectedIssue.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedIssue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                    <p className="text-sm">{selectedIssue.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Severity</h4>
                    <Badge className={getSeverityColor(selectedIssue.severity)}>
                      {selectedIssue.severity}/5
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    <Badge className={getStatusColor(selectedIssue.status)}>
                      {selectedIssue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Reported</h4>
                    <p className="text-sm">{formatDate(selectedIssue.created_at)}</p>
                  </div>
                </div>

                {selectedIssue.address && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-sm">{selectedIssue.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photos */}
            {selectedIssue.photos && selectedIssue.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Photos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedIssue.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo.url}
                          alt={`Issue photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reporter Information */}
            {selectedIssue.reported_by_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Reporter Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                    <p className="text-sm">{selectedIssue.reported_by_name}</p>
                  </div>
                  {selectedIssue.reported_by_email && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm">{selectedIssue.reported_by_email}</p>
                      </div>
                    </div>
                  )}
                  {selectedIssue.reported_by_phone && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-sm">{selectedIssue.reported_by_phone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Update Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Internal Notes
                  </label>
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add internal notes (not visible to citizens)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  {ISSUE_STATUSES.map((status) => (
                    <Button
                      key={status.value}
                      variant="outline"
                      onClick={() => handleStatusUpdate(status.value)}
                      disabled={updating || selectedIssue.status === status.value}
                      className="w-full justify-start"
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Issue Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Issue Reported</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(selectedIssue.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedIssue.assigned_to_name && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Assigned to Official</p>
                        <p className="text-xs text-gray-500">
                          {selectedIssue.assigned_to_name}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedIssue.resolved_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Resolved</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedIssue.resolved_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDetailsPage
