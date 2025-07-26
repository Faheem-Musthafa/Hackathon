import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, MapPin, Clock, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  severity: string;
  status: string;
  reporter_name: string | null;
  created_at: string;
}

interface SearchFilters {
  query: string;
  categories: string[];
  severities: string[];
  status: string;
  dateRange: string;
  location: string;
}

export const SearchReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    severities: [],
    status: 'all',
    dateRange: 'all',
    location: ''
  });

  const categories = ['accident', 'construction', 'weather', 'traffic', 'road_damage', 'other'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['active', 'resolved', 'verified'];

  const searchReports = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('reports').select('*');

      // Text search in title, description, and location
      if (filters.query.trim()) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location.ilike.%${filters.query}%`);
      }

      // Category filter
      if (filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      // Severity filter
      if (filters.severities.length > 0) {
        query = query.in('severity', filters.severities);
      }

      // Status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Location filter
      if (filters.location.trim()) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.dateRange) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);

    } catch (error) {
      console.error('Error searching reports:', error);
      toast({
        title: "Error searching reports",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    searchReports();
  }, [searchReports]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleSeverityChange = (severity: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      severities: checked 
        ? [...prev.severities, severity]
        : prev.severities.filter(s => s !== severity)
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      categories: [],
      severities: [],
      status: 'all',
      dateRange: 'all',
      location: ''
    });
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const hasActiveFilters = filters.query || filters.categories.length > 0 || 
    filters.severities.length > 0 || filters.status !== 'all' || 
    filters.dateRange !== 'all' || filters.location;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Search Reports</h1>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Query */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={filters.query}
                      onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Filter by location..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select 
                    value={filters.dateRange} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categories</label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                        />
                        <label htmlFor={category} className="text-sm flex items-center space-x-2 cursor-pointer">
                          <span>{getCategoryIcon(category)}</span>
                          <span className="capitalize">{category.replace('_', ' ')}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <div className="space-y-2">
                    {severities.map(severity => (
                      <div key={severity} className="flex items-center space-x-2">
                        <Checkbox
                          id={severity}
                          checked={filters.severities.includes(severity)}
                          onCheckedChange={(checked) => handleSeverityChange(severity, checked as boolean)}
                        />
                        <label htmlFor={severity} className="text-sm capitalize cursor-pointer">
                          {severity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">Search Results</h2>
                <Badge variant="outline">{reports.length} found</Badge>
              </div>
              <Button onClick={searchReports} variant="outline" size="sm" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                          <div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={getSeverityColor(report.severity)}>
                                {report.severity}
                              </Badge>
                              <Badge variant="outline">
                                {report.category.replace('_', ' ')}
                              </Badge>
                              <Badge variant="secondary">
                                {report.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeAgo(report.created_at)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{report.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{report.location}</span>
                      </div>
                      {report.reporter_name && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Reported by: {report.reporter_name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
