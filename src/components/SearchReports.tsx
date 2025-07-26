import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, MapPin, Clock, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCategoryIcon, getSeverityVariant, formatTimeAgo } from "@/lib/utils";

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

export const SearchReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchReports = useCallback(async () => {
    // Don't search if no filters are applied
    if (!searchTerm.trim() && categoryFilter === "all" && severityFilter === "all" && dateFilter === "all") {
      setReports([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from("reports")
        .select("*")
        .eq("status", "active");

      // Apply search filter
      if (searchTerm.trim()) {
        const searchValue = searchTerm.trim();
        // Use individual ilike filters instead of string concatenation for security
        query = query.or(
          `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,location.ilike.%${searchValue}%`
        );
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      // Apply severity filter
      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }

      // Apply date filter
      if (dateFilter !== "all") {
        const now = new Date();
        let startDate: Date;
        
        switch (dateFilter) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      setReports(data || []);
      
      if (data && data.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search criteria.",
        });
      }
    } catch (error) {
      console.error("Error searching reports:", error);
      toast({
        title: "Error searching reports",
        description: "Please try again later.",
        variant: "destructive",
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, severityFilter, dateFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCategoryFilter("all");
    setSeverityFilter("all");
    setDateFilter("all");
    setReports([]);
    setHasSearched(false);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchReports();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchReports]);

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || severityFilter !== "all" || dateFilter !== "all";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchReports();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl mb-8">
          <CardHeader className="text-center pb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 mb-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <Search className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardTitle className="text-4xl font-black mb-4 bg-gradient-to-r from-green-600 via-teal-600 to-blue-500 bg-clip-text text-transparent">
              Search Reports
            </CardTitle>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Find specific reports by searching titles, descriptions, locations, or using advanced filters.
              Discover patterns and track specific incidents across your area.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search reports by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-12 text-lg"
              />
            </form>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Advanced Filters</span>
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All</span>
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="weather">Weather Condition</SelectItem>
                      <SelectItem value="traffic">Traffic Jam</SelectItem>
                      <SelectItem value="hazard">Road Hazard</SelectItem>
                      <SelectItem value="maintenance">Road Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Search className="w-3 h-3" />
                    <span>"{searchTerm}"</span>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="outline">
                    Category: {categoryFilter.replace("_", " ")}
                  </Badge>
                )}
                {severityFilter !== "all" && (
                  <Badge variant="outline">
                    Severity: {severityFilter}
                  </Badge>
                )}
                {dateFilter !== "all" && (
                  <Badge variant="outline">
                    Date: {dateFilter === "today" ? "Today" : dateFilter === "week" ? "Last 7 Days" : "Last 30 Days"}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Searching reports...</span>
              </div>
            </Card>
          ) : hasSearched && reports.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Found {reports.length} report{reports.length !== 1 ? "s" : ""}
                </h2>
              </div>
              
              <div className="grid gap-4">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{report.title}</h3>
                            <Badge variant={getSeverityVariant(report.severity)}>
                              {report.severity}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{report.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{report.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeAgo(report.created_at)}</span>
                            </div>
                            {report.reporter_name && (
                              <span>by {report.reporter_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(report.category)}
                          <Badge variant="outline">{report.category.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : hasSearched && reports.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </Card>
          ) : !hasSearched ? (
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to search</h3>
              <p className="text-muted-foreground">
                Enter a search term or use the filters above to find reports.
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};
