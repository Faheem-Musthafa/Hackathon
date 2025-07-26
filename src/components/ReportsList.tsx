import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Clock, MapPin, AlertTriangle, Loader2, RefreshCw, Trash2, Search, Filter } from "lucide-react";
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

export const ReportsList = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('reports')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: sortOrder === 'oldest' });

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Apply search filter locally for better performance
      const filteredData = searchTerm 
        ? data.filter(report => 
            report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.location.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : data;

      setReports(filteredData || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error loading reports",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm, sortOrder]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('reports-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports',
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setReports(prev => prev.filter(r => r.id !== payload.old.id));
        } else if (payload.eventType === 'INSERT') {
          setReports(prev => [payload.new as Report, ...prev]);
          toast({
            title: 'New Report',
            description: 'A new report has been added.',
          });
        } else if (payload.eventType === 'UPDATE') {
          setReports(prev => 
            prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'accident': return '🚗';
      case 'construction': return '🚧';
      case 'weather': return '🌧️';
      case 'traffic': return '🚦';
      case 'road_damage': return '🕳️';
      default: return '⚠️';
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

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    const reportId = reportToDelete.id;
    setDeletingId(reportId);
    
    try {
      // Try hard delete first
      let {error} = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);
      
      // If hard delete not allowed, fall back to soft delete
      if (error) {
        console.warn('Hard delete failed, attempting soft delete:', error.message);
        const { error: updateError } = await supabase
          .from('reports')
          .update({ status: 'resolved' })
          .eq('id', reportId);
        if (updateError) throw updateError;
      }
      
      setReports(prev => prev.filter(r => r.id !== reportId));
      toast({
        title: "Report deleted",
        description: "The report has been successfully removed.",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error deleting report",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setReportToDelete(null);
    }
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setSortOrder('newest');
  };

  const filteredReportsCount = reports.length;
  const totalReportsCount = reports.length;

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
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Live Reports</h1>
            <p className="text-muted-foreground mt-2">
              {filteredReportsCount} of {totalReportsCount} reports
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search reports..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="accident">Accidents</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
                <SelectItem value="road_damage">Road Damage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="ml-2">Refresh</span>
            </Button>
            
            {(filter !== 'all' || searchTerm || sortOrder !== 'newest') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {reports.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm || filter !== 'all'
                  ? "No reports match your current filters. Try adjusting your search or filters."
                  : "No active reports have been submitted yet."}
              </p>
              
              {(searchTerm || filter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => (
              <Card 
                key={report.id} 
                className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl mt-1">{getCategoryIcon(report.category)}</span>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant={getSeverityVariant(report.severity)}>
                            {report.severity}
                          </Badge>
                          <Badge variant="outline">
                            {report.category.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatTimeAgo(report.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-9 px-3"
                      onClick={() => handleDeleteClick(report)}
                      disabled={deletingId === report.id}
                    >
                      {deletingId === report.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4">{report.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{report.location}</span>
                    </div>
                    
                    {report.reporter_name && (
                      <div className="text-sm text-muted-foreground">
                        Reported by: <span className="font-medium">{report.reporter_name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};