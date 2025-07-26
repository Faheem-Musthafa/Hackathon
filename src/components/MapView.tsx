import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Navigation, Loader2, RefreshCw, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// Leaflet imports
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  severity: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export const MapView = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error loading map data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const userLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setUserLocation(userLoc);
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    getUserLocation();
  }, [fetchReports, getUserLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !reports.length) return;

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194],
      userLocation ? 13 : 10
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapRef.current = map;

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(map).bindPopup('Your Location');
      
      userMarkerRef.current = userMarker;
    }

    // Add report markers
    const addMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];

      reports.forEach(report => {
        if (!report.latitude || !report.longitude) return;

        // Create custom icon based on severity
        const severityColor = getSeverityColor(report.severity);
        const categoryIcon = getCategoryIcon(report.category);
        
        const icon = L.divIcon({
          className: 'report-marker',
          html: `
            <div class="relative">
              <div class="w-8 h-8 rounded-full ${severityColor} border-2 border-white shadow-lg flex items-center justify-center">
                <span class="text-white text-sm">${categoryIcon}</span>
              </div>
              <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([report.latitude, report.longitude], {
          icon: icon
        }).addTo(map);

        // Add popup
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${report.title}</h3>
            <p class="text-sm">${report.description.substring(0, 60)}${report.description.length > 60 ? '...' : ''}</p>
            <div class="mt-2">
              <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                ${report.severity}
              </span>
            </div>
          </div>
        `);

        // Add click handler
        marker.on('click', () => {
          setSelectedReport(report);
        });

        markersRef.current.push(marker);
      });
    };

    addMarkers();

    // Clean up
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [reports, userLocation]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accident': return '🚗';
      case 'construction': return '🚧';
      case 'weather': return '🌧️';
      case 'traffic': return '🚦';
      case 'road_damage': return '🕳️';
      default: return '⚠️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accident': return 'text-red-500';
      case 'construction': return 'text-yellow-500';
      case 'weather': return 'text-blue-500';
      case 'traffic': return 'text-orange-500';
      case 'road_damage': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interactive Map</h1>
            <p className="text-gray-600 mt-2">View and manage reports on the map</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={centerOnUser} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              My Location
            </Button>
            <Button 
              onClick={fetchReports} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Report Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-56px)] p-0 relative">
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-full rounded-b-lg"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Reports List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nearby Reports</h2>
              <Badge variant="secondary" className="text-sm">
                {reports.length} reports
              </Badge>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const distance = userLocation && report.latitude && report.longitude
                    ? calculateDistance(userLocation.lat, userLocation.lng, report.latitude, report.longitude)
                    : null;
                  
                  return (
                    <Card 
                      key={report.id} 
                      className={`cursor-pointer transition-all hover:shadow-md border ${
                        selectedReport?.id === report.id 
                          ? 'ring-2 ring-primary border-primary' 
                          : ''
                      } ${getSeverityBgColor(report.severity)}`}
                      onClick={() => {
                        setSelectedReport(report);
                        if (report.latitude && report.longitude && mapRef.current) {
                          mapRef.current.setView([report.latitude, report.longitude], 15);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className={`text-xl ${getCategoryColor(report.category)}`}>
                              {getCategoryIcon(report.category)}
                            </span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{report.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={report.severity === 'critical' ? 'destructive' : 'default'}
                                  className="text-xs py-0.5 px-2"
                                >
                                  {report.severity}
                                </Badge>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(report.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {distance && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-medium text-gray-700">
                                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                              </span>
                              <Badge variant="outline" className="mt-1 text-xs">
                                Nearby
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm truncate max-w-[140px]">
                              {report.location}
                            </span>
                          </div>
                          {report.latitude && report.longitude && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-3 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                openInMaps(report.latitude!, report.longitude!);
                              }}
                            >
                              <Navigation className="w-3 h-3 mr-1" />
                              Navigate
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
                    <p className="text-gray-500">There are currently no reports with location data</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        {/* Selected Report Details */}
        {selectedReport && (
          <Card className="mt-6 border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3">
                <span className={`text-2xl ${getCategoryColor(selectedReport.category)}`}>
                  {getCategoryIcon(selectedReport.category)}
                </span>
                <div>
                  <span>{selectedReport.title}</span>
                  <Badge 
                    variant={selectedReport.severity === 'critical' ? 'destructive' : 'default'}
                    className="ml-3"
                  >
                    {selectedReport.severity}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <p className="text-gray-700 mb-4">{selectedReport.description}</p>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{selectedReport.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Reported on {formatDate(selectedReport.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-start">
                  {selectedReport.latitude && selectedReport.longitude && (
                    <Button
                      onClick={() => openInMaps(selectedReport.latitude!, selectedReport.longitude!)}
                      className="w-full flex items-center justify-center gap-2 mb-3"
                    >
                      <Navigation className="w-4 h-4" />
                      Open in Maps
                    </Button>
                  )}
                  
                  <div className="w-full bg-gray-100 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Report Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{selectedReport.category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Severity:</span>
                        <span className="font-medium capitalize">{selectedReport.severity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Report ID:</span>
                        <span className="font-mono text-xs">{selectedReport.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};