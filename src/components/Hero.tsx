import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, AlertTriangle, Clock, Users, Shield, TrendingUp, Globe, Zap } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Hero Section */}
          <div className="mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mb-8 shadow-2xl">
              <MapPin className="w-12 h-12 text-primary-foreground" />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              RouteReport
              <span className="block text-4xl md:text-5xl mt-2 text-foreground">Live</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Real-time road condition reporting platform. Help keep our communities safe by reporting accidents, 
              construction, weather conditions, and traffic issues with instant updates.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Button 
                onClick={onGetStarted}
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
              >
                <AlertTriangle className="w-6 h-6 mr-3" />
                Report an Issue
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:bg-accent/10 transition-all duration-300 text-lg px-8 py-6"
              >
                <Globe className="w-6 h-6 mr-3" />
                Learn More
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Real-time Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Community Driven</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">Instant</div>
                <div className="text-muted-foreground">Alert System</div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-Time Updates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get instant notifications about road conditions and incidents in your area with live updates.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Driven</h3>
              <p className="text-muted-foreground leading-relaxed">
                Powered by drivers like you, helping each other stay informed and safe on the roads.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-destructive/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Safety First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Help prevent accidents by sharing important road hazard information with your community.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-green-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Analytics & Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                View detailed analytics and insights to understand road condition patterns and trends.
              </p>
            </Card>
          </div>

          {/* How It Works Section */}
          <div className="mt-20">
            <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Report an Issue</h3>
                <p className="text-muted-foreground">
                  Use our simple form to report road conditions, accidents, or hazards with location data.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Alert</h3>
                <p className="text-muted-foreground">
                  Your report is immediately shared with the community and emergency services if needed.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Stay Informed</h3>
                <p className="text-muted-foreground">
                  Receive real-time updates and view reports on our interactive map and analytics dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};