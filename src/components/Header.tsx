import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, Plus, List, Search, BarChart3, Map, Menu, X, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  currentView: 'home' | 'dashboard' | 'reports' | 'create' | 'search' | 'analytics' | 'map';
  onViewChange: (view: 'home' | 'dashboard' | 'reports' | 'create' | 'search' | 'analytics' | 'map') => void;
}

export const Header = ({ currentView, onViewChange }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { key: 'home', label: 'Home', icon: null },
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'reports', label: 'Reports', icon: List },
    { key: 'search', label: 'Search', icon: Search },
    { key: 'map', label: 'Map', icon: Map },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'create', label: 'Report Issue', icon: Plus },
  ];

  const handleNavigation = (view: 'home' | 'dashboard' | 'reports' | 'create' | 'search' | 'analytics' | 'map') => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <MapPin className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                RouteReport
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium">Live</p>
            </div>
          </div>
          
          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.key}
                variant={currentView === item.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation(item.key as 'home' | 'dashboard' | 'reports' | 'create' | 'search' | 'analytics' | 'map')}
                className={`flex items-center space-x-2 transition-all duration-300 px-4 py-2 rounded-xl font-medium ${
                  currentView === item.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h2 className="text-lg font-bold">RouteReport Live</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.key}
                      variant={currentView === item.key ? 'default' : 'ghost'}
                      className="w-full justify-start"
                                             onClick={() => handleNavigation(item.key as 'home' | 'reports' | 'create' | 'search' | 'analytics' | 'map')}
                    >
                      {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                      {item.label}
                    </Button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t">
                  <div className="text-sm text-muted-foreground mb-4">
                    Real-time road condition reporting
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live System</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
