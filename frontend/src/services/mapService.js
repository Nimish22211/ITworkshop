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
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    )
    const data = await response.json()
    return data.display_name || 'Unknown location'
  } catch (error) {
    console.error('Error getting address:', error)
    return 'Unknown location'
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
