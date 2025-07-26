import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Clock,
  Users,
  Activity,
  Bell,
  Cloud,
  BarChart3,
  Map,
  Plus
} from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';
import { NotificationCenter } from './NotificationCenter';
import { ReportStatusTracker } from './ReportStatusTracker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  totalReports: number;
  activeReports: number;
  resolvedToday: number;
  criticalReports: number;
  recentActivity: number;
  userReports: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: () => void;
}

interface DashboardProps {
  onNavigate: (view: string) => void;
  userLocation?: { lat: number; lng: number };
  className?: string;
}

export const Dashboard = memo(function Dashboard({ onNavigate, userLocation, className = '' }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    activeReports: 0,
    resolvedToday: 0,
    criticalReports: 0,
    recentActivity: 0,
    userReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | undefined>(userLocation);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    // Try to get user location if not provided
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Could not get user location:', error);
        }
      );
    }
  }, [userLocation]);

  const fetchDashboardStats = async () => {
    try {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*');

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const totalReports = reports?.length || 0;
      const activeReports = reports?.filter(r => r.status === 'active' || r.status === 'in_progress').length || 0;
      const resolvedToday = reports?.filter(r => 
        r.status === 'resolved' && new Date(r.updated_at || r.created_at) >= today
      ).length || 0;
      const criticalReports = reports?.filter(r => r.severity === 'critical' || r.severity === 'high').length || 0;
      const recentActivity = reports?.filter(r => new Date(r.created_at) >= last24Hours).length || 0;

      setStats({
        totalReports,
        activeReports,
        resolvedToday,
        criticalReports,
        recentActivity,
        userReports: Math.floor(totalReports * 0.1) // Simulate user's reports
      });

      // Set recent reports for activity feed
      const recent = reports?.slice(0, 5) || [];
      setRecentReports(recent);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'report',
      title: 'Report Issue',
      description: 'Report a new road condition or hazard',
      icon: Plus,
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      action: () => onNavigate('create')
    },
    {
      id: 'map',
      title: 'View Map',
      description: 'See all reports on interactive map',
      icon: Map,
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      action: () => onNavigate('map')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed reports and trends',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-green-500 to-teal-500',
      action: () => onNavigate('analytics')
    },
    {
      id: 'search',
      title: 'Search Reports',
      description: 'Find specific reports and incidents',
      icon: AlertTriangle,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      action: () => onNavigate('search')
    }
  ];

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: LayoutDashboard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Issues',
      value: stats.activeReports,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Resolved Today',
      value: stats.resolvedToday,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Critical Reports',
      value: stats.criticalReports,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      change: '0%',
      changeType: 'neutral'
    }
  ];

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
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
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 relative overflow-hidden ${className}`}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.05),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your comprehensive view of road conditions and community reports
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' :
                          stat.changeType === 'negative' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">vs last week</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="weather">Weather</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                      <Button
                        key={action.id}
                        onClick={action.action}
                        className={`${action.color} text-white h-auto p-6 flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      >
                        <action.icon className="w-8 h-8" />
                        <div className="text-center">
                          <div className="font-semibold">{action.title}</div>
                          <div className="text-xs opacity-90 mt-1">{action.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.length > 0 ? (
                      recentReports.map((report, index) => {
                        const severityColor =
                          report.severity === 'critical' ? 'bg-red-500' :
                          report.severity === 'high' ? 'bg-orange-500' :
                          report.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500';

                        const timeAgo = new Date(report.created_at);
                        const now = new Date();
                        const diffHours = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60 * 60));
                        const timeText = diffHours < 1 ? 'Just now' :
                                        diffHours < 24 ? `${diffHours}h ago` :
                                        `${Math.floor(diffHours / 24)}d ago`;

                        return (
                          <div key={report.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200">
                            <div className={`w-2 h-2 ${severityColor} rounded-full`}></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                {report.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {report.location} • {timeText}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {report.category?.replace('_', ' ')}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Recent reports will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weather">
              <div className="space-y-6">
                <WeatherWidget
                  userLocation={currentUserLocation || userLocation}
                  className="w-full"
                />
                {!currentUserLocation && !userLocation && (
                  <Card className="border-0 bg-blue-50 dark:bg-blue-950/30 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                        Enable Location for Local Weather
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Allow location access to get weather conditions for your area and receive road condition warnings.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-6">
                <NotificationCenter
                  isOpen={true}
                  onClose={() => setShowNotifications(false)}
                />
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="space-y-6">
                {recentReports.length > 0 ? (
                  <ReportStatusTracker reportId={recentReports[0].id} />
                ) : (
                  <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                        No Reports to Track
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                        Report status tracking will appear here when you have active reports
                      </p>
                      <Button
                        onClick={() => onNavigate('create')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Report
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
});
