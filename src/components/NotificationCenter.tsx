import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Bell, BellRing, Check, X, AlertTriangle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  location: string;
  severity: string;
  category: string;
  created_at: string;
  [key: string]: any; // For any additional fields
}

interface Notification {
  id: string;
  type: 'new_report' | 'critical_report' | 'status_update';
  title: string;
  message: string;
  reportId?: string;
  severity?: string;
  category?: string;
  read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate notifications based on real reports
  const generateNotifications = useCallback(async () => {
    let isMounted = true;
    
    try {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
        .returns<Report[]>();

      if (error) {
        throw error;
      }

      const mockNotifications: Notification[] = reports?.map((report, index) => {
        const isRecent = new Date(report.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
        const isCritical = report.severity === 'critical' || report.severity === 'high';
        
        let type: Notification['type'] = 'new_report';
        let title = 'New Report Submitted';
        let message = `${report.title} reported in ${report.location.split(',')[0]}`;

        if (isCritical) {
          type = 'critical_report';
          title = `${report.severity.toUpperCase()} Alert`;
          message = `Critical incident: ${report.title}`;
        }

        return {
          id: `notif-${report.id}-${index}`,
          type,
          title,
          message,
          reportId: report.id,
          severity: report.severity,
          category: report.category,
          read: !isRecent || Math.random() > 0.7, // Some notifications are read
          created_at: report.created_at
        };
      }) || [];

      if (isMounted) {
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Error generating notifications:', error);
      toast({
        title: "Error loading notifications",
        description: "Failed to load notifications. Please try again later.",
        variant: "destructive",
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      generateNotifications();
    }
  }, [isOpen, generateNotifications]);

  // Real-time subscription for new reports
  useEffect(() => {
    const subscription = supabase
      .channel('notifications-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'reports' 
        }, 
        (payload) => {
          const newReport = payload.new as Report;
          const isCritical = newReport.severity === 'critical' || newReport.severity === 'high';
          
          const notification: Notification = {
            id: `notif-${newReport.id}-${Date.now()}`,
            type: isCritical ? 'critical_report' : 'new_report',
            title: isCritical ? `${newReport.severity.toUpperCase()} Alert` : 'New Report Submitted',
            message: isCritical 
              ? `Critical incident: ${newReport.title}`
              : `${newReport.title} reported in ${newReport.location.split(',')[0]}`,
            reportId: newReport.id,
            severity: newReport.severity,
            category: newReport.category,
            read: false,
            created_at: newReport.created_at
          };

          setNotifications(prev => [notification, ...prev]);
          
          // Show toast for critical reports
          if (isCritical) {
            toast({
              title: "Critical Alert",
              description: notification.message,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'critical_report':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'new_report':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'status_update':
        return <Clock className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
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

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <Card className="w-96 max-h-[80vh] mt-16 mr-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BellRing className="w-5 h-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            {notification.severity && (
                              <Badge 
                                variant={notification.severity === 'critical' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {notification.severity}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNotification(notification.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// Notification Bell Component for Header
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate unread count - in real app, this would come from a proper notification system
    const interval = setInterval(() => {
      setUnreadCount(Math.floor(Math.random() * 5));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
