import { useState, useEffect, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, AlertTriangle, MapPin, Clock, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalReports: number;
  reportsByCategory: { [key: string]: number };
  reportsBySeverity: { [key: string]: number };
  recentTrends: { date: string; count: number }[];
  topLocations: { location: string; count: number }[];
}

interface FilterState {
  category: string;
  searchTerm: string;
  sortOrder: 'newest' | 'oldest';
  reportCount: number;
}

export const Analytics = memo(() => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalReports: 0,
    reportsByCategory: {},
    reportsBySeverity: {},
    recentTrends: [],
    topLocations: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [filterState, setFilterState] = useState<FilterState | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    // Listen for filter updates from ReportsList
    const handleFilterUpdate = (event: CustomEvent<FilterState>) => {
      setFilterState(event.detail);
    };

    window.addEventListener('reportsFiltered', handleFilterUpdate as EventListener);
    return () => {
      window.removeEventListener('reportsFiltered', handleFilterUpdate as EventListener);
    };
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Process analytics data
      const totalReports = reports?.length || 0;
      
      const reportsByCategory = reports?.reduce((acc: { [key: string]: number }, report) => {
        acc[report.category] = (acc[report.category] || 0) + 1;
        return acc;
      }, {}) || {};

      const reportsBySeverity = reports?.reduce((acc: { [key: string]: number }, report) => {
        acc[report.severity] = (acc[report.severity] || 0) + 1;
        return acc;
      }, {}) || {};

      // Generate trend data (simplified)
      const recentTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10) + 1
        };
      }).reverse();

      const topLocations = Object.entries(
        reports?.reduce((acc: { [key: string]: number }, report) => {
          if (report.location) {
            acc[report.location] = (acc[report.location] || 0) + 1;
          }
          return acc;
        }, {}) || {}
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));

      setAnalytics({
        totalReports,
        reportsByCategory,
        reportsBySeverity,
        recentTrends,
        topLocations
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const getSeverityColor = useMemo(() => (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      case 'critical': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getCategoryIcon = useMemo(() => (category: string) => {
    switch (category) {
      case 'pothole': return '🕳️';
      case 'traffic_light': return '🚦';
      case 'road_closure': return '🚧';
      case 'accident': return '🚗';
      case 'construction': return '🏗️';
      case 'weather': return '🌧️';
      default: return '📍';
    }
  }, []);

  // Memoize expensive calculations
  const averageReportsPerDay = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Math.round(analytics.totalReports / days);
  }, [analytics.totalReports, timeRange]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalytics} variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter State Display */}
        {filterState && (
          <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    📊 Analyzing Filtered Reports
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-blue-800">
                    {filterState.category !== 'all' && (
                      <Badge variant="outline" className="bg-blue-100">
                        Category: {filterState.category.replace('_', ' ')}
                      </Badge>
                    )}
                    {filterState.searchTerm && (
                      <Badge variant="outline" className="bg-blue-100">
                        Search: "{filterState.searchTerm}"
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-blue-100">
                      Sort: {filterState.sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100">
                      Reports: {filterState.reportCount}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">
                    Filtered from Reports List
                  </p>
                  <p className="text-xs text-blue-500">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                  <p className="text-3xl font-bold">{analytics.totalReports}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-3xl font-bold">{Object.keys(analytics.reportsByCategory).length}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Locations</p>
                  <p className="text-3xl font-bold">{analytics.topLocations.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg/Day</p>
                  <p className="text-3xl font-bold">
                    {averageReportsPerDay}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reports by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Reports by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.reportsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <span className="capitalize">{category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / analytics.totalReports) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reports by Severity */}
          <Card>
            <CardHeader>
              <CardTitle>Reports by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.reportsBySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`}></div>
                      <span className="capitalize">{severity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(count / analytics.totalReports) * 100} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Locations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topLocations.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm">{location.location}</span>
                  </div>
                  <Badge variant="outline">{location.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

Analytics.displayName = 'Analytics';

export default Analytics;
