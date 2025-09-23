import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { MapPin, Calendar, AlertCircle } from 'lucide-react'
import { formatDate, getStatusColor, getSeverityColor } from '../../utils/helpers'

const IssueCard = ({ issue, onClick, isSelected = false }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-gray-900 line-clamp-2">
              {issue.title}
            </h3>
            <Badge className={getStatusColor(issue.status)}>
              {issue.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {issue.description}
          </p>

          {/* Meta Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{issue.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>Severity: {issue.severity}/5</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(issue.created_at)}</span>
              </div>
              {issue.photos && issue.photos.length > 0 && (
                <span className="text-blue-600">
                  {issue.photos.length} photo{issue.photos.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Severity Badge */}
          <div className="flex justify-end">
            <Badge 
              variant="outline" 
              className={getSeverityColor(issue.severity)}
            >
              Severity {issue.severity}/5
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default IssueCard
