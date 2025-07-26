import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ReportForm } from "@/components/ReportForm";
import { ReportsList } from "@/components/ReportsList";
import { SearchReports } from "@/components/SearchReports";
import { MapView } from "@/components/MapView";
import { Analytics } from "@/components/Analytics";

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'reports' | 'create' | 'search' | 'analytics' | 'map'>('home');

  const handleGetStarted = () => {
    setCurrentView('create');
  };

  const handleReportSuccess = () => {
    setCurrentView('reports');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      {currentView === 'home' && <Hero onGetStarted={handleGetStarted} />}
      {currentView === 'create' && <ReportForm onSuccess={handleReportSuccess} />}
      {currentView === 'reports' && <ReportsList />}
      {currentView === 'search' && <SearchReports />}
      {currentView === 'map' && <MapView />}
      {currentView === 'analytics' && <Analytics />}
    </div>
  );
};

export default Index;
