import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Report } from '@/hooks/use-reports';

// Fix default marker icon issue in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface ReportsMapProps {
  reports: Report[];
  center?: [number, number]; // Optional initial center
  zoom?: number;
}

export function ReportsMap({ reports, center = [51.505, -0.09], zoom = 13 }: ReportsMapProps) {
  // Filter out reports without valid coordinates
  const validReports = reports.filter(r => r.latitude !== null && r.longitude !== null);

  // If there are valid reports, center the map on the first one
  const mapCenter = validReports.length > 0
    ? [validReports[0].latitude as number, validReports[0].longitude as number]
    : center;

  return (
    <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <MapContainer center={mapCenter} zoom={zoom} style={{ width: '100%', height: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validReports.map(report => (
          <Marker key={report.id} position={[report.latitude as number, report.longitude as number]}>
            <Popup>
              <strong>{report.title}</strong><br />
              {report.description}<br />
              <em>{report.location}</em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}