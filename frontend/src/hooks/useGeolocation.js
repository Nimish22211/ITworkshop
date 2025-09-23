import { useState, useEffect } from 'react'
import { getCurrentLocation } from '../services/mapService'

export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLocation = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const coords = await getCurrentLocation()
      setLocation(coords)
      return coords
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-fetch location on mount if permission is granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (err) => {
          // Silently fail for auto-fetch
          console.log('Geolocation not available:', err.message)
        }
      )
    }
  }, [])

  return {
    location,
    loading,
    error,
    getLocation
  }
}
