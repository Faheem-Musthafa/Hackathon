import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ReportsMap.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import type { Report } from '@/hooks/use-reports';
import { MapControls, type MapFilters } from './MapControls';

// Fix default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on severity
const createCustomIcon = (severity: string) => {
  const color = severity === 'high' ? '#ef4444' :
                severity === 'medium' ? '#f59e0b' : '#10b981';

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface ReportsMapProps {
  reports: Report[];
  center?: [number, number];
  zoom?: number;
  height?: string | number;
  loading?: boolean;
  className?: string;
}

interface ValidReport extends Omit<Report, 'latitude' | 'longitude'> {
  latitude: number;
  longitude: number;
}

// Type guard to check if a report has valid coordinates
function isValidReport(report: Report): report is ValidReport {
  return typeof report.latitude === 'number' && 
         typeof report.longitude === 'number' && 
         !isNaN(report.latitude) && 
         !isNaN(report.longitude) &&
         report.latitude >= -90 && 
         report.latitude <= 90 &&
         report.longitude >= -180 && 
         report.longitude <= 180;
}

// Calculate the center point of all valid reports
function calculateReportsCenter(validReports: ValidReport[]): [number, number] {
  if (validReports.length === 0) {
    console.log('No valid reports, using default center (NYC)');
    return [40.7128, -74.0060]; // Default to NYC
  }

  const avgLat = validReports.reduce((sum, report) => sum + report.latitude, 0) / validReports.length;
  const avgLng = validReports.reduce((sum, report) => sum + report.longitude, 0) / validReports.length;

  console.log('Calculated center from reports:', [avgLat, avgLng]);
  return [avgLat, avgLng];
}

// Component to fit map bounds to show all markers
function MapBoundsHandler({ validReports, mapRef }: { validReports: ValidReport[], mapRef: React.RefObject<LeafletMap | null> }) {
  useEffect(() => {
    if (validReports.length > 1 && mapRef.current) {
      const bounds = L.latLngBounds(
        validReports.map(report => [report.latitude, report.longitude])
      );
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [validReports, mapRef]);

  return null;
}

export function ReportsMap({
  reports,
  center,
  zoom = 13,
  height = '50vh',
  loading = false,
  className = ''
}: ReportsMapProps) {
  const [mapError, setMapError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MapFilters>({
    categories: [],
    severities: [],
    searchQuery: '',
    dateRange: { start: null, end: null }
  });
  const mapRef = useRef<LeafletMap | null>(null);

  // Filter reports based on active filters
  const filteredReports = reports.filter(report => {
    // First check if report has valid coordinates
    if (!isValidReport(report)) return false;

    // Apply category filter
    if (filters.categories.length > 0 && !filters.categories.includes(report.category)) {
      return false;
    }

    // Apply severity filter
    if (filters.severities.length > 0 && !filters.severities.includes(report.severity)) {
      return false;
    }

    // Apply search query filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      const searchableText = [
        report.title,
        report.description,
        report.location,
        report.category,
        report.reporter_name
      ].filter(Boolean).join(' ').toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Apply date range filter (if implemented)
    // TODO: Add date range filtering logic here

    return true;
  });

  // Filter out reports without valid coordinates using type guard
  const validReports = filteredReports.filter(isValidReport);

  // Calculate map center
  const mapCenter: LatLngExpression = center || calculateReportsCenter(validReports);

  // Handle map creation
  const handleMapReady = () => {
    console.log('Map is ready, reports:', reports.length, 'valid reports:', validReports.length);
  };

  // Convert height prop to CSS value
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  if (mapError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}
        style={{ height: heightValue }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Failed to load map</p>
          <p className="text-gray-600 text-sm mt-1">{mapError}</p>
          <button 
            onClick={() => setMapError(null)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-xl ${className}`}
        style={{ height: heightValue }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  console.log('ReportsMap rendering with:', {
    reportsCount: reports.length,
    validReportsCount: validReports.length,
    loading,
    mapError,
    heightValue,
    mapCenter
  });

  // Add error boundary for map rendering
  try {
    return (
    <div
      className={`w-full rounded-xl overflow-hidden shadow-lg border-2 border-blue-500 ${className}`}
      style={{ height: heightValue, minHeight: '400px' }}
    >
      {/* Debug info */}
      <div className="absolute top-2 left-2 bg-white p-2 text-xs z-[1001] rounded shadow">
        Reports: {reports.length} | Valid: {validReports.length} | Center: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
      </div>

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
        zoomControl={true}
        whenReady={handleMapReady}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validReports.length > 1 && <MapBoundsHandler validReports={validReports} mapRef={mapRef} />}

        {validReports.map(report => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCustomIcon(report.severity)}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  {report.title}
                </h3>
                <p className="text-gray-700 mb-2 leading-relaxed">
                  {report.description}
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Location:</span> {report.location}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Category:</span> {report.category}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Severity:</span>
                    <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                      report.severity === 'high' ? 'bg-red-100 text-red-800' :
                      report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.severity}
                    </span>
                  </p>
                  {report.reporter_name && (
                    <p className="text-gray-600">
                      <span className="font-medium">Reporter:</span> {report.reporter_name}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {validReports.length === 0 && reports.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
          <div className="text-center p-4">
            <p className="text-gray-600">No reports with valid coordinates to display</p>
            <p className="text-gray-500 text-sm mt-1">
              {reports.length} report{reports.length !== 1 ? 's' : ''} found, but none have location data
            </p>
          </div>
        </div>
      )}
      
      {reports.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="text-center p-4">
            <p className="text-gray-600">No reports to display</p>
            <p className="text-gray-500 text-sm mt-1">Reports will appear here when available</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <MapControls
        reports={reports}
        onFilterChange={setFilters}
      />

      {/* Map Legend */}
      {validReports.length > 0 && (
        <div className="map-legend">
          <h4>Report Severity</h4>
          <div className="legend-item">
            <div className="legend-color high"></div>
            <span>High</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium"></div>
            <span>Medium</span>
          </div>
          <div className="legend-item">
            <div className="legend-color low"></div>
            <span>Low</span>
          </div>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Error rendering ReportsMap:', error);
    return (
      <div
        className={`flex items-center justify-center bg-red-50 rounded-xl border-2 border-red-200 ${className}`}
        style={{ height: heightValue, minHeight: '400px' }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-red-500 text-sm mt-1">Failed to load map component</p>
          <p className="text-xs text-gray-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}