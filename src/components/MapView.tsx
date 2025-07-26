import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Navigation, Loader2, RefreshCw, Calendar, AlertTriangle, Globe, TrendingUp, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCategoryIcon, getSeverityColor, getCategoryColor, formatDate, calculateDistance, openInMaps } from "@/lib/utils";
import { ReportsMap } from "./ReportsMap";
import { SimpleMap } from "./SimpleMap";
import type { Database } from "@/integrations/supabase/types";

// Use the proper Supabase type
type Report = Database['public']['Tables']['reports']['Row'];

interface MapStats {
  totalReports: number;
  reportsWithLocation: number;
  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  categoryBreakdown: {
    [key: string]: number;
  };
  recentReports: number; // Reports from last 24 hours
}

export const MapView = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [stats, setStats] = useState<MapStats | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching reports from Supabase...');

      // Fetch all active reports (including those without location for stats)
      const { data: allReports, error: allError } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (allError) throw allError;

      // Filter reports with location for map display
      const reportsWithLocation = (allReports || []).filter(
        report => report.latitude !== null && report.longitude !== null
      );

      setReports(reportsWithLocation);
      setLastFetchTime(new Date());

      // Calculate statistics
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const severityBreakdown = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      };

      const categoryBreakdown: { [key: string]: number } = {};
      let recentReports = 0;

      (allReports || []).forEach(report => {
        // Count severity
        if (report.severity in severityBreakdown) {
          severityBreakdown[report.severity as keyof typeof severityBreakdown]++;
        }

        // Count categories
        categoryBreakdown[report.category] = (categoryBreakdown[report.category] || 0) + 1;

        // Count recent reports
        if (new Date(report.created_at) > yesterday) {
          recentReports++;
        }
      });

      const calculatedStats: MapStats = {
        totalReports: allReports?.length || 0,
        reportsWithLocation: reportsWithLocation.length,
        severityBreakdown,
        categoryBreakdown,
        recentReports
      };

      setStats(calculatedStats);

      console.log('✅ Successfully fetched reports:', {
        total: calculatedStats.totalReports,
        withLocation: calculatedStats.reportsWithLocation,
        recent: calculatedStats.recentReports
      });

    } catch (error) {
      console.error('❌ Error fetching reports:', error);
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
    console.log('🎯 Get Location button clicked - requesting REAL user location');

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('❌ Geolocation not supported in this browser');
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    // Check if we're on HTTPS (required for geolocation in most browsers)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.log('⚠️ Not on HTTPS - geolocation may not work');
      toast({
        title: "HTTPS Required",
        description: "Location services require a secure connection (HTTPS).",
        variant: "destructive",
      });
      return;
    }

    console.log('🔄 Starting real location request...');
    setLocationLoading(true);

    try {
      // Request the user's actual current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        console.log('📡 Calling navigator.geolocation.getCurrentPosition...');

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('✅ Real location obtained successfully:', {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: new Date(pos.timestamp).toLocaleString()
            });
            resolve(pos);
          },
          (err) => {
            console.log('❌ Geolocation error:', {
              code: err.code,
              message: err.message,
              PERMISSION_DENIED: err.code === 1,
              POSITION_UNAVAILABLE: err.code === 2,
              TIMEOUT: err.code === 3
            });
            reject(err);
          },
          {
            enableHighAccuracy: true, // Use GPS if available
            timeout: 20000, // 20 second timeout
            maximumAge: 60000 // Accept cached position up to 1 minute old
          }
        );
      });

      // Extract the real coordinates
      const userLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log('📍 Setting REAL user location:', userLoc);
      console.log('🎯 Accuracy:', position.coords.accuracy, 'meters');

      setUserLocation(userLoc);

      // Update the map to center on user's location with appropriate zoom
      // This will be handled by the SimpleMap component when userLocation changes

      toast({
        title: "Your location detected!",
        description: `Map centered on your location (±${Math.round(position.coords.accuracy)}m accuracy)`,
      });

    } catch (error: unknown) {
      console.error('❌ Error getting real user location:', error);

      let errorMessage = "Unable to get your current location.";
      let errorTitle = "Location Error";

      // Handle specific geolocation errors
      if (error && typeof error === 'object' && 'code' in error) {
        const geoError = error as GeolocationPositionError;
        console.log('🔍 Geolocation error details:', {
          code: geoError.code,
          message: geoError.message
        });

        if (geoError.code === 1) {
          errorTitle = "Permission Denied";
          errorMessage = "Please allow location access when prompted by your browser, or check your browser's location settings.";
        } else if (geoError.code === 2) {
          errorTitle = "Location Unavailable";
          errorMessage = "Your device's location could not be determined. Make sure location services are enabled.";
        } else if (geoError.code === 3) {
          errorTitle = "Request Timeout";
          errorMessage = "Location request timed out. Please try again or check your internet connection.";
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    // Set up real-time subscription for new reports
    const subscription = supabase
      .channel('reports_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
          filter: 'status=eq.active'
        },
        (payload) => {
          console.log('Real-time update:', payload);

          if (payload.eventType === 'INSERT') {
            const newReport = payload.new as Report;
            // Only add if it has location data
            if (newReport.latitude && newReport.longitude) {
              setReports(prev => [newReport, ...prev]);
              toast({
                title: "New report added",
                description: `${newReport.title} - ${newReport.location}`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedReport = payload.new as Report;
            setReports(prev =>
              prev.map(report =>
                report.id === updatedReport.id ? updatedReport : report
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedReport = payload.old as Report;
            setReports(prev =>
              prev.filter(report => report.id !== deletedReport.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
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

  const refreshData = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchReports();
    if (!userLocation) {
      getUserLocation();
    }
    toast({
      title: "Data refreshed",
      description: "Map data has been updated successfully.",
    });
  }, [fetchReports, getUserLocation, userLocation]);







  // Function to center map on user location (for re-centering)
  const centerOnUser = useCallback(() => {
    if (!userLocation) {
      toast({
        title: "No location set",
        description: "Please get your location first.",
        variant: "destructive",
      });
      return;
    }

    console.log('🎯 Re-centering map on user location');
    toast({
      title: "Map centered",
      description: "Map view centered on your location.",
    });

    // The SimpleMap component will handle the actual centering via the userLocation prop
    // We can trigger a re-render by updating the userLocation state
    setUserLocation({ ...userLocation });
  }, [userLocation]);

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
              variant={userLocation ? "default" : "outline"}
              disabled={locationLoading}
              className={`flex items-center gap-2 ${userLocation ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className={`w-4 h-4 ${userLocation ? 'text-white' : ''}`} />
              )}
              {userLocation ? 'Location Set ✓' : 'Get My Location'}
            </Button>

            {userLocation && (
              <>
                <Button
                  onClick={centerOnUser}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Globe className="w-3 h-3" />
                  Center on Me
                </Button>
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </span>
                </Badge>
              </>
            )}
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

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Reports</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalReports}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">With Location</p>
                    <p className="text-2xl font-bold text-green-900">{stats.reportsWithLocation}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Last 24 Hours</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.recentReports}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Coverage</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats.totalReports > 0 ? Math.round((stats.reportsWithLocation / stats.totalReports) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Integration */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] overflow-hidden shadow-xl border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Interactive Map
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-56px)] p-0 relative">
                <SimpleMap reports={reports} height="100%" userLocation={userLocation} />
              </CardContent>
            </Card>
          </div>
          {/* Enhanced Reports List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reports with Location</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {reports.length} reports
                </Badge>
                {lastFetchTime && (
                  <Badge variant="outline" className="text-xs">
                    Updated {lastFetchTime.toLocaleTimeString()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Severity Breakdown */}
            {stats && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Severity Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(stats.severityBreakdown).map(([severity, count]) => {
                    const percentage = stats.totalReports > 0 ? (count / stats.totalReports) * 100 : 0;
                    const colorClass = severity === 'critical' ? 'bg-red-500' :
                                     severity === 'high' ? 'bg-orange-500' :
                                     severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500';

                    return (
                      <div key={severity} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                          <span className="capitalize">{severity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-16 h-2" />
                          <span className="text-xs text-gray-500 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
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
        {/* Selected Report Details (unchanged) */}
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