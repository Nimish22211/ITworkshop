import L from 'leaflet'
import { getMarkerColor } from '../../services/mapService'

const IssueMarker = ({ issue }) => {
  const color = getMarkerColor(issue.status)
  
  const customIcon = L.divIcon({
    className: 'issue-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
      ">
        ${issue.severity}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  return null // This component is used by the parent to create the icon
}

export default IssueMarker
