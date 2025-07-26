import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Settings, 
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  severity: string;
  status: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  progress_percentage?: number;
  estimated_completion?: string;
}

interface ReportStatusTrackerProps {
  reportId?: string;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    label: 'Pending Review',
    description: 'Report submitted and awaiting review'
  },
  active: {
    icon: AlertTriangle,
    color: 'bg-blue-500',
    textColor: 'text-blue-800',
    bgColor: 'bg-blue-100',
    label: 'Active',
    description: 'Report confirmed and being addressed'
  },
  in_progress: {
    icon: Settings,
    color: 'bg-orange-500',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-100',
    label: 'In Progress',
    description: 'Work is currently underway'
  },
  resolved: {
    icon: CheckCircle,
    color: 'bg-green-500',
    textColor: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Resolved',
    description: 'Issue has been fixed'
  },
  closed: {
    icon: CheckCircle,
    color: 'bg-gray-500',
    textColor: 'text-gray-800',
    bgColor: 'bg-gray-100',
    label: 'Closed',
    description: 'Report closed'
  }
};

export function ReportStatusTracker({ reportId, className = '' }: ReportStatusTrackerProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  useEffect(() => {
    if (reportId) {
      fetchReportDetails();
      fetchStatusHistory();
    }
  }, [reportId]);

  const fetchReportDetails = async () => {
    if (!reportId) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast({
        title: "Error",
        description: "Failed to load report details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusHistory = async () => {
    if (!reportId) return;

    try {
      // This would require a status_history table in a real implementation
      // For now, we'll simulate some history data
      const mockHistory = [
        {
          id: 1,
          status: 'pending',
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          note: 'Report submitted by user'
        },
        {
          id: 2,
          status: 'active',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          note: 'Report verified and marked as active'
        },
        {
          id: 3,
          status: 'in_progress',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          note: 'Repair crew dispatched to location'
        }
      ];
      setStatusHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching status history:', error);
    }
  };

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Report not found</p>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = statusConfig[report.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Status Card */}
      <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Report Status
            </CardTitle>
            <Badge 
              className={`${currentStatus.bgColor} ${currentStatus.textColor} border-0 px-3 py-1 font-semibold`}
            >
              <StatusIcon className="w-4 h-4 mr-1" />
              {currentStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>{report.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Reported {new Date(report.created_at).toLocaleDateString()}</span>
              </div>
              {report.reporter_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  <span>By {report.reporter_name}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Category: </span>
                <span className="text-gray-600 dark:text-gray-400 capitalize">{report.category.replace('_', ' ')}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Severity: </span>
                <Badge 
                  variant="outline" 
                  className={`capitalize ${
                    report.severity === 'high' ? 'border-red-300 text-red-700' :
                    report.severity === 'medium' ? 'border-yellow-300 text-yellow-700' :
                    'border-green-300 text-green-700'
                  }`}
                >
                  {report.severity}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {report.progress_percentage !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-gray-600 dark:text-gray-400">{report.progress_percentage}%</span>
              </div>
              <Progress value={report.progress_percentage} className="h-2" />
            </div>
          )}

          {/* Status Description */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentStatus.description}
            </p>
            {report.estimated_completion && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Estimated completion: {new Date(report.estimated_completion).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Status History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusHistory.map((entry, index) => {
              const entryStatus = statusConfig[entry.status as keyof typeof statusConfig];
              const EntryIcon = entryStatus?.icon || Clock;
              
              return (
                <div key={entry.id} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full ${entryStatus?.color || 'bg-gray-500'} flex items-center justify-center flex-shrink-0`}>
                    <EntryIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {entryStatus?.label || 'Unknown Status'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {entry.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
