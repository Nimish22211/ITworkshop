import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'
import { 
  BarChart3, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users,
  TrendingUp,
  Filter,
  X,
  ChevronDown,
  Star,
  Calendar,
  Eye,
  Activity,
  Zap
} from 'lucide-react'
import { formatDate, getStatusColor } from '../utils/helpers'
import { ISSUE_STATUSES } from '../utils/constants'

// Custom UI Components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 ${className}`} {...props}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`p-6 pb-4 ${className}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-semibold text-slate-900 dark:text-white ${className}`} {...props}>
    {children}
  </h3>
)

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)

const Badge = ({ children, className = "", ...props }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`} {...props}>
    {children}
  </span>
)

const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform hover:-translate-y-0.5"
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6"
  }
  
  const variantStyles = {
    default: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700",
    outline: "border-2 border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 backdrop-blur-sm shadow-md hover:shadow-lg"
  }
  
  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  
  const handleSelect = (newValue) => {
    setSelectedValue(newValue)
    onValueChange(newValue)
    setIsOpen(false)
  }
  
  return (
    <div className="relative" {...props}>
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedValue === 'all' ? 'All Issues' : selectedValue.replace('_', ' ')}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden">
          {React.Children.map(children, (child) => 
            React.cloneElement(child, { onSelect: handleSelect })
          )}
        </div>
      )}
    </div>
  )
}

const SelectItem = ({ value, children, onSelect }) => (
  <div
    className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors duration-150 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
    onClick={() => onSelect(value)}
  >
    {children}
  </div>
)

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

  const getSeverityColor = (severity) => {
    if (severity >= 4) return 'text-red-500'
    if (severity >= 3) return 'text-orange-500'
    return 'text-green-500'
  }

  const filteredIssues = selectedStatus === 'all' 
    ? issues 
    : issues.filter(issue => issue.status === selectedStatus)

  const isAdmin = user?.role === 'admin'
  const isOfficial = user?.role === 'official'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#f0f9ff_1px,transparent_1px),linear-gradient(to_bottom,#f0f9ff_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-20 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl border-b border-white/20 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-200">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Welcome back, <span className="text-blue-600 dark:text-blue-400">{user?.name}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">System Online</span>
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectItem value="all">All Issues</SelectItem>
                {ISSUE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        {isAdmin && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Issues</CardTitle>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{analytics.totalIssues}</div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span>All reported issues</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Resolved</CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{analytics.resolvedIssues}</div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-green-500 font-medium">
                    {analytics.totalIssues > 0 ? 
                      `${Math.round((analytics.resolvedIssues / analytics.totalIssues) * 100)}%` : 
                      '0%'
                    }
                  </span>
                  <span className="ml-1">success rate</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg Resolution</CardTitle>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 transition-colors">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {analytics.avgResolutionTime ? `${Math.round(analytics.avgResolutionTime)}h` : 'N/A'}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Zap className="w-3 h-3 mr-1 text-orange-500" />
                  <span>Average response time</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Resolution Rate</CardTitle>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {analytics.totalIssues > 0 ? 
                    `${Math.round((analytics.resolvedIssues / analytics.totalIssues) * 100)}%` : 
                    '0%'
                  }
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-purple-500 font-medium">Issues resolved</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Issues List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>{isAdmin ? 'All Issues' : 'Issues'}</span>
                  <Badge className="bg-blue-100 text-blue-800 border border-blue-200 ml-auto">
                    {filteredIssues.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredIssues.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredIssues.map((issue, index) => (
                      <div
                        key={issue.id}
                        className={`p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 cursor-pointer transition-all duration-200 group ${index === 0 ? 'bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/10' : ''}`}
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {issue.title}
                              </h3>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < issue.severity ? getSeverityColor(issue.severity) : 'text-gray-300'} fill-current`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                              {issue.description.length > 100 
                                ? `${issue.description.substring(0, 100)}...` 
                                : issue.description
                              }
                            </p>
                            
                            <div className="flex items-center flex-wrap gap-3 text-xs">
                              <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                                {issue.category}
                              </Badge>
                              <div className="flex items-center text-slate-500 dark:text-slate-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(issue.created_at)}
                              </div>
                              {issue.photos && issue.photos.length > 0 && (
                                <div className="flex items-center text-slate-500 dark:text-slate-400">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {issue.photos.length} photo{issue.photos.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={`${getStatusColor(issue.status)} font-medium`}>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                            {issue.assigned_to && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Assigned to {issue.assigned_to}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No issues found</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Issue Details Sidebar */}
          {selectedIssue && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Issue Details</CardTitle>
                    <button
                      onClick={() => setSelectedIssue(null)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">
                      {selectedIssue.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                      {selectedIssue.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</span>
                      <Badge className={`${getStatusColor(selectedIssue.status)} font-medium`}>
                        {selectedIssue.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedIssue.category}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Severity</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < selectedIssue.severity ? getSeverityColor(selectedIssue.severity) : 'text-gray-300'} fill-current`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Reported</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatDate(selectedIssue.created_at)}
                      </span>
                    </div>
                  </div>

                  {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Photos</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedIssue.photos.map((photo, index) => (
                          <div key={index} className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
                            <img
                              src={photo.url}
                              alt={`Issue photo ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 hidden items-center justify-center">
                              <Eye className="w-6 h-6 text-slate-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update Actions */}
                  {(isOfficial || isAdmin) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Update Status</h4>
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