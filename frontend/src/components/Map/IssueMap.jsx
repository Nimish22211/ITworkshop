import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import IssueMarker from './IssueMarker'
import { MAP_DEFAULTS } from '../../utils/constants'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl

// Create custom colored icons for different statuses
const createColoredIcon = (status) => {
  const colors = {
    reported: '#ef4444',     // Red
    acknowledged: '#f59e0b', // Yellow/Orange
    in_progress: '#3b82f6',  // Blue
    resolved: '#10b981',     // Green
    verified: '#8b5cf6'      // Purple
  }
  
  const color = colors[status] || '#6b7280' // Default gray
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${status === 'reported' ? '!' : 
          status === 'acknowledged' ? '?' : 
          status === 'in_progress' ? '⚡' : 
          status === 'resolved' ? '✓' : 
          status === 'verified' ? '★' : '•'}
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5]
  })
}

const MapController = ({ issues, onIssueSelect, selectedIssue }) => {
  const map = useMap()

  useEffect(() => {
    if (issues.length > 0) {
      const bounds = L.latLngBounds(
        issues.map(issue => [issue.latitude, issue.longitude])
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [issues, map])

  useEffect(() => {
    if (selectedIssue) {
      map.setView([selectedIssue.latitude, selectedIssue.longitude], 16)
    }
  }, [selectedIssue, map])

  return null
}

const IssueMap = ({ issues, onIssueSelect, selectedIssue }) => {
  const mapRef = useRef()

  return (
    <div className="h-full w-full">
      <MapContainer
        center={MAP_DEFAULTS.center}
        zoom={MAP_DEFAULTS.zoom}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          issues={issues} 
          onIssueSelect={onIssueSelect}
          selectedIssue={selectedIssue}
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount()
            const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large'
            return L.divIcon({
              html: `<div class="cluster-marker cluster-${size}"><span>${count}</span></div>`,
              className: 'custom-cluster-icon',
              iconSize: L.point(40, 40, true)
            })
          }}
        >
          {issues.map((issue) => (
            <Marker
              key={issue.id}
              position={[issue.latitude, issue.longitude]}
              icon={createColoredIcon(issue.status)}
              eventHandlers={{
                click: () => onIssueSelect(issue)
              }}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {issue.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded">{issue.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">Severity:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < issue.severity ? 'text-red-500' : 'text-gray-300'}`}>
                            ●
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'reported' ? 'bg-red-100 text-red-800' :
                        issue.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                        issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Reported: {new Date(issue.created_at).toLocaleDateString()}
                    </div>
                    {issue.photos && issue.photos.length > 0 && (
                      <div className="mt-2">
                        <img 
                          src={issue.photos[0].url} 
                          alt="Issue" 
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

export default IssueMap
