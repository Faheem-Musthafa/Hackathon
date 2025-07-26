import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, Plus, List, Search, BarChart3, Map, Menu, X } from "lucide-react";

interface HeaderProps {
  currentView: 'home' | 'reports' | 'create' | 'search' | 'analytics' | 'map';
  onViewChange: (view: 'home' | 'reports' | 'create' | 'search' | 'analytics' | 'map') => void;
}

export const Header = ({ currentView, onViewChange }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { key: 'home', label: 'Home', icon: null },
    { key: 'reports', label: 'Reports', icon: List },
    { key: 'search', label: 'Search', icon: Search },
    { key: 'map', label: 'Map', icon: Map },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'create', label: 'Report Issue', icon: Plus },
  ];

  const handleNavigation = (view: 'home' | 'reports' | 'create' | 'search' | 'analytics' | 'map') => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RouteReport
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Live</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Button
                key={item.key}
                variant={currentView === item.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation(item.key as 'home' | 'reports' | 'create' | 'search' | 'analytics' | 'map')}
                className="flex items-center space-x-2 transition-all duration-200"
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
