import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Navigation, Loader2, RefreshCw, Calendar, AlertTriangle, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCategoryIcon, getSeverityColor, getCategoryColor, formatDate, calculateDistance, openInMaps } from "@/lib/utils";

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
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'active')
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
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });
      
      const userLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setUserLocation(userLoc);
      
      toast({
        title: "Location detected",
        description: "Your location has been set for distance calculations.",
      });
    } catch (error) {
      console.error('Error getting user location:', error);
      toast({
        title: "Location access denied",
        description: "Please enable location services to see distances to reports.",
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const refreshData = () => {
    fetchReports();
    if (!userLocation) {
      getUserLocation();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports Map View</h1>
            <p className="text-muted-foreground mt-2">View reports with location data and get directions</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={getUserLocation} 
              variant="outline"
              disabled={locationLoading}
              className="flex items-center gap-2"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {userLocation ? 'Update Location' : 'Get My Location'}
            </Button>
            <Button 
              onClick={refreshData} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Placeholder */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] overflow-hidden shadow-xl border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Interactive Map
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-56px)] p-0 relative">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-b-lg flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Integration</h3>
                    <p className="text-gray-600 mb-4 max-w-md">
                      Interactive map view is being enhanced. For now, use the "Navigate" buttons to open locations in Google Maps.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Reports with location data: {reports.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Reports List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reports with Location</h2>
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
                      onClick={() => setSelectedReport(report)}
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
          <Card className="mt-6 border-t-4 border-t-primary shadow-xl">
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
                      {userLocation && selectedReport.latitude && selectedReport.longitude && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-medium">
                            {(() => {
                              const distance = calculateDistance(
                                userLocation.lat, 
                                userLocation.lng, 
                                selectedReport.latitude!, 
                                selectedReport.longitude!
                              );
                              return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
                            })()}
                          </span>
                        </div>
                      )}
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