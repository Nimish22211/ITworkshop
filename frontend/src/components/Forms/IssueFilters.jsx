import { useState } from 'react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Filter, X } from 'lucide-react'
import { ISSUE_CATEGORIES, ISSUE_STATUSES, SEVERITY_LEVELS } from '../../utils/constants'

const IssueFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFilterChange(localFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      status: 'all',
      severity: null,
      assigned_to: null
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== 'all' && value !== null && value !== ''
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={localFilters.category}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ISSUE_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <span className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={localFilters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ISSUE_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Severity Filter */}
        <div>
          <Label htmlFor="severity">Minimum Severity</Label>
          <Select
            value={localFilters.severity?.toString() || 'all'}
            onValueChange={(value) => handleFilterChange('severity', value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Severity</SelectItem>
              {SEVERITY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value.toString()}>
                  {level.label} - {level.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="startDate">From Date</Label>
            <Input
              id="startDate"
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">To Date</Label>
            <Input
              id="endDate"
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {localFilters.category !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Category: {ISSUE_CATEGORIES.find(c => c.value === localFilters.category)?.label}
                </span>
              )}
              {localFilters.status !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Status: {ISSUE_STATUSES.find(s => s.value === localFilters.status)?.label}
                </span>
              )}
              {localFilters.severity && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Min Severity: {localFilters.severity}/5
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default IssueFilters
