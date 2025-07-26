import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, AlertTriangle, Clock, MapPin, Users, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalReports: number;
  recentReports: number;
  categoryCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  dailyReports: Array<{ date: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
}

export const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Fetch all reports within time range
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate analytics
      const totalReports = reports?.length || 0;
      const recentReports = reports?.filter(r => 
        new Date(r.created_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
      ).length || 0;

      // Category counts
      const categoryCounts: Record<string, number> = {};
      reports?.forEach(report => {
        categoryCounts[report.category] = (categoryCounts[report.category] || 0) + 1;
      });

      // Severity counts
      const severityCounts: Record<string, number> = {};
      reports?.forEach(report => {
        severityCounts[report.severity] = (severityCounts[report.severity] || 0) + 1;
      });

      // Daily reports for the last 7 days
      const dailyReports: Array<{ date: string; count: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const count = reports?.filter(r => 
          r.created_at.split('T')[0] === dateStr
        ).length || 0;
        dailyReports.push({ date: dateStr, count });
      }

      // Top locations
      const locationCounts: Record<string, number> = {};
      reports?.forEach(report => {
        const location = report.location.split(',')[0].trim(); // Get first part of location
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
      
      const topLocations = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));

      setData({
        totalReports,
        recentReports,
        categoryCounts,
        severityCounts,
        dailyReports,
        topLocations
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error loading analytics",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
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

  if (!data) return null;

  const maxDailyCount = Math.max(...data.dailyReports.map(d => d.count));

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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.recentReports}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.severityCounts.critical || 0}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.topLocations.length}</div>
              <p className="text-xs text-muted-foreground">Unique reporting areas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Reports Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Reports (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.dailyReports.map((day, index) => (
                  <div key={day.date} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="bg-primary h-4 rounded"
                          style={{ 
                            width: `${maxDailyCount > 0 ? (day.count / maxDailyCount) * 100 : 0}%`,
                            minWidth: day.count > 0 ? '8px' : '0px'
                          }}
                        />
                        <span className="text-sm font-medium">{day.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Reports by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.categoryCounts)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{getCategoryIcon(category)}</span>
                        <span className="capitalize">{category.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.severityCounts)
                  .sort(([,a], [,b]) => b - a)
                  .map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="capitalize">{severity}</span>
                      <Badge variant={getSeverityColor(severity)}>{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Most Reported Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topLocations.map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
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
    </div>
  );
};
