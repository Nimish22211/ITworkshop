import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIssues } from '../context/IssueContext'
import { useGeolocation } from '../hooks/useGeolocation'
import { uploadMultipleImages } from '../services/cloudinaryService'
import { getAddressFromCoordinates } from '../services/mapService'
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from '../utils/constants'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { MapPin, Upload, Camera, X } from 'lucide-react'
import toast from 'react-hot-toast'

const ReportIssuePage = () => {
  const navigate = useNavigate()
  const { createIssue } = useIssues()
  const { location, getLocation, loading: locationLoading } = useGeolocation()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 3,
    latitude: location?.latitude || '',
    longitude: location?.longitude || '',
    address: '',
    photos: []
  })
  
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLocationClick = async () => {
    try {
      const coords = await getLocation()
      const address = await getAddressFromCoordinates(coords.latitude, coords.longitude)
      
      setFormData(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address
      }))
      
      toast.success('Location updated!')
    } catch (error) {
      toast.error('Failed to get location: ' + error.message)
    }
  }

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadResults = await uploadMultipleImages(files)
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploadResults]
      }))
      toast.success(`${uploadResults.length} photos uploaded!`)
    } catch (error) {
      toast.error('Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Please select a location')
      return
    }

    setSubmitting(true)
    try {
      const result = await createIssue({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      })

      if (result.success) {
        toast.success('Issue reported successfully!')
        navigate('/')
      }
    } catch (error) {
      toast.error('Failed to report issue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-6 w-6" />
              <span>Report New Issue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto bg-white">
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

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the issue"
                  rows={4}
                  required
                />
              </div>

              {/* Severity */}
              <div>
                <Label htmlFor="severity">Severity Level</Label>
                <Select
                  value={formData.severity.toString()}
                  onValueChange={(value) => handleInputChange('severity', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto bg-white">
                    {SEVERITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-gray-500">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <Label>Location *</Label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Latitude"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      type="number"
                      step="any"
                      required
                    />
                    <Input
                      placeholder="Longitude"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      type="number"
                      step="any"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLocationClick}
                      disabled={locationLoading}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Address (auto-filled)"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              </div>

              {/* Photos */}
              <div>
                <Label>Photos</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="photos"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="photos"
                      className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Camera className="h-4 w-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Photos'}</span>
                    </label>
                  </div>

                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo.url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Reporting...' : 'Report Issue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportIssuePage
