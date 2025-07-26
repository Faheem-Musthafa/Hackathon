import { Button } from "@/components/ui/button";
import { MapPin, Plus, List, Search, BarChart3, Map } from "lucide-react";

interface HeaderProps {
  currentView: 'home' | 'reports' | 'create' | 'search' | 'analytics' | 'map';
  onViewChange: (view: 'home' | 'reports' | 'create' | 'search' | 'analytics' | 'map') => void;
}

export const Header = ({ currentView, onViewChange }: HeaderProps) => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RouteReport Live
            </h1>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('home')}
            >
              Home
            </Button>
            <Button
              variant={currentView === 'reports' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('reports')}
              className="flex items-center space-x-2"
            >
              <List className="w-4 h-4" />
              <span>Reports</span>
            </Button>
            <Button
              variant={currentView === 'search' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('search')}
              className="flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Button>
            <Button
              variant={currentView === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('map')}
              className="flex items-center space-x-2"
            >
              <Map className="w-4 h-4" />
              <span>Map</span>
            </Button>
            <Button
              variant={currentView === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('analytics')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </Button>
            <Button
              variant={currentView === 'create' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('create')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Report Issue</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
