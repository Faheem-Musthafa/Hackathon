import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ReportForm } from "@/components/ReportForm";
import { ReportsList } from "@/components/ReportsList";
import { SearchReports } from "@/components/SearchReports";
import { MapView } from "@/components/MapView";
import { Analytics } from "@/components/Analytics";
import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'reports' | 'create' | 'search' | 'analytics' | 'map'>('home');

  const handleGetStarted = () => {
    setCurrentView('create');
  };

  const handleReportSuccess = () => {
    setCurrentView('reports');
  };

  const handleNavigate = (view: string) => {
    const validViews = ['home', 'dashboard', 'reports', 'create', 'search', 'analytics', 'map'];
    if (validViews.includes(view)) {
      setCurrentView(view as 'home' | 'dashboard' | 'reports' | 'create' | 'search' | 'analytics' | 'map');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,146,60,0.05),transparent_50%)]"></div>

      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 relative z-10">
        <div className="animate-fade-in">
          {currentView === 'home' && <Hero onGetStarted={handleGetStarted} />}
          {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentView === 'create' && <ReportForm onSuccess={handleReportSuccess} />}
          {currentView === 'reports' && <ReportsList onViewChange={setCurrentView} />}
          {currentView === 'search' && <SearchReports />}
          {currentView === 'map' && <MapView />}
          {currentView === 'analytics' && <Analytics />}
        </div>
      </main>

      {/* Show footer only on home page for better UX */}
      {currentView === 'home' && <Footer />}
    </div>
  );
};

export default Index;
