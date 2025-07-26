import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Report } from '@/hooks/use-reports';

// Add CSS for pulse animation
const pulseStyle = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }
`;

// Inject CSS into document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = pulseStyle;
  document.head.appendChild(styleElement);
}

interface SimpleMapProps {
  reports: Report[];
  height?: string;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export function SimpleMap({ reports, height = '400px', className = '', userLocation }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // Filter reports with valid coordinates
  const validReports = reports.filter(report =>
    typeof report.latitude === 'number' &&
    typeof report.longitude === 'number' &&
    !isNaN(report.latitude) &&
    !isNaN(report.longitude)
  );

  // Determine map center - prioritize user location over reports
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : validReports.length > 0
      ? [validReports[0].latitude!, validReports[0].longitude!]
      : [40.7128, -74.0060]; // Default to NYC

  // Determine zoom level - higher zoom for user location
  const zoomLevel = userLocation ? 15 : validReports.length > 1 ? 12 : 13;

  console.log('SimpleMap rendering:', {
    totalReports: reports.length,
    validReports: validReports.length,
    userLocation: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'none',
    center,
    zoomLevel
  });

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView(center, zoomLevel);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMapRef.current);
    } else {
      // Smoothly update map center and zoom when user location changes
      if (userLocation) {
        console.log('🎯 Centering map on user location with smooth animation');
        leafletMapRef.current.setView([userLocation.lat, userLocation.lng], zoomLevel, {
          animate: true,
          duration: 1.5 // Smooth 1.5 second animation
        });
      }
    }

    // Clear existing markers (but preserve user location marker)
    leafletMapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || (layer instanceof L.CircleMarker && layer !== userMarkerRef.current)) {
        leafletMapRef.current!.removeLayer(layer);
      }
    });

    // Add distinctive user location marker
    if (userLocation && leafletMapRef.current) {
      // Remove existing user marker
      if (userMarkerRef.current) {
        leafletMapRef.current.removeLayer(userMarkerRef.current);
      }

      // Create distinctive blue circle marker for user location
      userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 12,
        fillColor: '#3b82f6', // Blue color
        color: '#ffffff', // White border
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(leafletMapRef.current);

      // Add pulsing effect with CSS animation
      const userMarkerElement = userMarkerRef.current.getElement() as HTMLElement;
      if (userMarkerElement) {
        userMarkerElement.style.animation = 'pulse 2s infinite';
        userMarkerElement.style.boxShadow = '0 0 0 0 rgba(59, 130, 246, 0.7)';
      }

      // Add popup for user location
      userMarkerRef.current.bindPopup(`
        <div style="text-align: center;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #3b82f6;">📍 Your Location</h3>
          <p style="font-size: 12px; color: #666; margin: 0;">
            ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}
          </p>
        </div>
      `);

      console.log('✅ Added distinctive user location marker');
    }

    // Add markers for valid reports
    validReports.forEach(report => {
      if (leafletMapRef.current) {
        L.marker([report.latitude!, report.longitude!])
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div>
              <h3 style="font-weight: bold; margin-bottom: 8px;">${report.title}</h3>
              <p style="font-size: 14px; margin-bottom: 8px;">${report.description}</p>
              <p style="font-size: 12px; color: #666;">${report.location}</p>
            </div>
          `);
      }
    });

    // Handle map bounds - prioritize user location
    if (userLocation && leafletMapRef.current) {
      // If user location is set, center on it with appropriate zoom
      console.log('🎯 Map centered on user location');
    } else if (validReports.length > 1 && leafletMapRef.current) {
      // Otherwise, fit bounds to show all reports
      const group = new L.FeatureGroup(
        validReports.map(report =>
          L.marker([report.latitude!, report.longitude!])
        )
      );
      leafletMapRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      // Cleanup on unmount
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        userMarkerRef.current = null;
      }
    };
  }, [validReports, center, userLocation, zoomLevel]);

  return (
    <div
      className={`w-full relative ${className}`}
      style={{ height }}
    >


      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        className="leaflet-map-container"
      />
    </div>
  );
}
