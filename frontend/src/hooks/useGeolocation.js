import { useState, useEffect } from 'react'
import { getCurrentLocation } from '../services/mapService'

export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [initialLocationFetched, setInitialLocationFetched] = useState(false)

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
    // Auto-fetch location on mount with better options
    if (navigator.geolocation && !initialLocationFetched) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setLocation(coords)
          setInitialLocationFetched(true)
          setLoading(false)
        },
        (err) => {
          console.log('Initial geolocation failed:', err.message)
          setError(err.message)
          setInitialLocationFetched(true)
          setLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000
        }
      )
    }
  }, [initialLocationFetched])

  return {
    location,
    loading,
    error,
    getLocation,
    initialLocationFetched
  }
}
