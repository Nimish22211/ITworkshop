// Map utility functions
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000, // Reduced to 5 seconds
        maximumAge: 60000 // 1 minute for fresher location
      }
    )
  })
}

export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      { signal: controller.signal }
    )
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data && data.display_name) {
      return data.display_name
    }
    
    // Fallback to coordinates if no address found
    return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  } catch (error) {
    console.error('Error getting address:', error)
    // Return coordinates as fallback instead of "Unknown location"
    return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  }
}

export const getMarkerColor = (status) => {
  const colors = {
    reported: '#ef4444',      // red
    acknowledged: '#f59e0b',  // yellow
    in_progress: '#3b82f6',   // blue
    resolved: '#10b981',      // green
    verified: '#8b5cf6'       // purple
  }
  return colors[status] || colors.reported
}

export const getMarkerIcon = (status) => {
  const color = getMarkerColor(status)
  return L.divIcon({
    className: 'issue-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}
