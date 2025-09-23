import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import IssueMarker from './IssueMarker'
import { MAP_DEFAULTS } from '../../utils/constants'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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

        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            eventHandlers={{
              click: () => onIssueSelect(issue)
            }}
          >
            <IssueMarker issue={issue} />
            <Popup>
              <div className="p-2">
                <h3 className="font-medium text-gray-900 mb-2">{issue.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{issue.category}</span>
                  <span>Severity: {issue.severity}/5</span>
                </div>
                <div className="mt-2">
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
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default IssueMap
