import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  severity: string;
  status: string;
  reporter_name: string | null;
  reporter_email: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

interface UseReportsOptions {
  filter?: string;
  searchTerm?: string;
  sortOrder?: 'newest' | 'oldest';
  status?: string;
}

export const useReports = (options: UseReportsOptions = {}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('reports')
        .select('*');

      // Apply status filter
      if (options.status) {
        query = query.eq('status', options.status);
      } else {
        query = query.eq('status', 'active');
      }

      // Apply category filter
      if (options.filter && options.filter !== 'all') {
        query = query.eq('category', options.filter);
      }

      // Apply sorting
      query = query.order('created_at', { ascending: options.sortOrder === 'oldest' });

      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Apply search filter locally for better performance
      let filteredData = data || [];
      if (options.searchTerm) {
        filteredData = filteredData.filter(report => 
          report.title.toLowerCase().includes(options.searchTerm!.toLowerCase()) ||
          report.description.toLowerCase().includes(options.searchTerm!.toLowerCase()) ||
          report.location.toLowerCase().includes(options.searchTerm!.toLowerCase())
        );
      }

      setReports(filteredData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error loading reports",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [options.filter, options.searchTerm, options.sortOrder, options.status]);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      // Try hard delete first
      const { error } = await supabase
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
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: "Error deleting report",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  const createReport = useCallback(async (reportData: Omit<Report, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('reports')
        .insert([reportData]);

      if (error) throw error;

      toast({
        title: "Report submitted successfully!",
        description: "Thank you for helping keep our roads safe.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: "Error submitting report",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

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
          const newReport = payload.new as Report;
          // Only add if it matches the current filter criteria
          if (options.status ? newReport.status === options.status : newReport.status === 'active') {
            setReports(prev => [newReport, ...prev]);
            toast({
              title: 'New Report',
              description: 'A new report has been added.',
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedReport = payload.new as Report;
          const expectedStatus = options.status || 'active';
          
          // If the report status no longer matches our filter, remove it
          if (updatedReport.status !== expectedStatus) {
            setReports(prev => prev.filter(r => r.id !== updatedReport.id));
          } else {
            // Update the report if it still matches our filter
            setReports(prev => 
              prev.map(r => r.id === updatedReport.id ? { ...r, ...updatedReport } : r)
            );
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.status]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    deleteReport,
    createReport,
  };
}; 