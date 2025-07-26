import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Filter,
  MapPin,
  Calendar,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Loader2
} from 'lucide-react';
import type { Report } from '@/hooks/use-reports';

interface MapControlsProps {
  reports: Report[];
  onFilterChange: (filters: MapFilters) => void;
  className?: string;
}

export interface MapFilters {
  categories: string[];
  severities: string[];
  searchQuery: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

const CATEGORIES = [
  'pothole',
  'traffic_light',
  'road_damage',
  'signage',
  'construction',
  'accident',
  'other'
];

const SEVERITIES = ['low', 'medium', 'high'];

export function MapControls({ reports, onFilterChange, className = '' }: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    categories: [],
    severities: [],
    searchQuery: '',
    dateRange: { start: null, end: null }
  });

  // Debounced search functionality
  const debouncedSearch = useCallback((query: string) => {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const updatedFilters = { ...filters, searchQuery: query };
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending timeouts
    };
  }, []);

  const updateFilters = (newFilters: Partial<MapFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleSeverity = (severity: string) => {
    const newSeverities = filters.severities.includes(severity)
      ? filters.severities.filter(s => s !== severity)
      : [...filters.severities, severity];
    updateFilters({ severities: newSeverities });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      categories: [],
      severities: [],
      searchQuery: '',
      dateRange: { start: null, end: null }
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return filters.categories.length + filters.severities.length + (filters.searchQuery ? 1 : 0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pothole': return '🕳️';
      case 'traffic_light': return '🚦';
      case 'road_damage': return '🛣️';
      case 'signage': return '🪧';
      case 'construction': return '🚧';
      case 'accident': return '💥';
      default: return '📍';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={`absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm shadow-lg border-0 max-w-[90vw] md:max-w-none ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-sm">Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 md:h-6 md:w-6"
              >
                <X className="w-4 h-4 md:w-3 md:h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 md:h-6 md:w-6"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 md:w-3 md:h-3" /> : <ChevronDown className="w-4 h-4 md:w-3 md:h-3" />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 min-w-[250px] md:min-w-[280px]">
            {/* Search Input */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Search className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Search Reports</span>
                {isSearching && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-8 text-xs pr-8"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-1 top-1 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Severity Filters */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Severity</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {SEVERITIES.map(severity => (
                  <Button
                    key={severity}
                    variant={filters.severities.includes(severity) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSeverity(severity)}
                    className={`h-8 md:h-6 text-xs capitalize min-w-[60px] ${
                      filters.severities.includes(severity)
                        ? getSeverityColor(severity)
                        : 'hover:' + getSeverityColor(severity)
                    }`}
                  >
                    {severity}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Category</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {CATEGORIES.map(category => (
                  <Button
                    key={category}
                    variant={filters.categories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className="h-8 md:h-6 text-xs justify-start"
                  >
                    <span className="mr-1">{getCategoryIcon(category)}</span>
                    <span className="truncate">{category.replace('_', ' ')}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Showing {reports.length} reports</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
