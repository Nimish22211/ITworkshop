import { useState, useEffect } from 'react'
import { useIssues } from '../context/IssueContext'
import IssueMap from '../components/Map/IssueMap'
import IssueFilters from '../components/Forms/IssueFilters'
import IssueCard from '../components/Common/IssueCard'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { MapPin, Plus, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const { issues, loading, filters, fetchIssues, setFilters } = useIssues()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)

  useEffect(() => {
    fetchIssues(filters)
  }, [filters])

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Civic Issues</h1>
                <p className="text-sm text-gray-600">Report and track municipal issues</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
              <Link to="/report">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Report Issue</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Issue Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <IssueMap
                  issues={issues}
                  onIssueSelect={handleIssueSelect}
                  selectedIssue={selectedIssue}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle>Filter Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <IssueFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </CardContent>
              </Card>
            )}

            {/* Issue List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : issues.length > 0 ? (
                  issues.slice(0, 10).map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onClick={() => handleIssueSelect(issue)}
                      isSelected={selectedIssue?.id === issue.id}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No issues found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
