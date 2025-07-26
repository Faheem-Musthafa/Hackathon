import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Clock, Users, Shield, TrendingUp, Globe, Zap, ArrowRight, Star, CheckCircle, Activity } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Background with Multiple Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,146,60,0.1),transparent_50%)]"></div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-7xl mx-auto">
          {/* Enhanced Hero Section */}
          <div className="mb-20">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live System Active</span>
              <Badge variant="secondary" className="text-xs">24/7</Badge>
            </div>

            {/* Logo with Enhanced Animation */}
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 mb-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <MapPin className="w-14 h-14 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              </div>
            </div>

            <h1 className="text-7xl md:text-8xl font-black mb-6 leading-none">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                RouteReport
              </span>
              <span className="block text-5xl md:text-6xl mt-4 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent font-bold">
                Live
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-5xl mx-auto font-medium">
              The most advanced real-time road condition reporting platform.
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> Report hazards instantly</span>,
              help your community stay safe, and access
              <span className="text-orange-500 font-semibold"> live traffic insights</span>.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Trusted by 10,000+ drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Real-time updates</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-lg px-10 py-7 rounded-2xl font-semibold group"
              >
                <AlertTriangle className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Report an Issue
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 text-lg px-10 py-7 rounded-2xl font-semibold group"
              >
                <Globe className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Explore Features
              </Button>
            </div>

            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="group">
                <Card className="p-8 text-center border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Real-time Monitoring</div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-2">Always Active</div>
                </Card>
              </div>
              <div className="group">
                <Card className="p-8 text-center border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform duration-300">100%</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Community Driven</div>
                  <div className="text-xs text-green-500 dark:text-green-400 mt-2">By the People</div>
                </Card>
              </div>
              <div className="group">
                <Card className="p-8 text-center border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-3 group-hover:scale-110 transition-transform duration-300">Instant</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Alert System</div>
                  <div className="text-xs text-orange-500 dark:text-orange-400 mt-2">Lightning Fast</div>
                </Card>
              </div>
            </div>
          </div>

          {/* Enhanced Features Section */}
          <div id="features" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Everything you need to stay informed and keep your community safe on the roads
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 group hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Real-time Updates</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Get instant notifications about road conditions, accidents, and hazards as they happen.
                  </p>
                </div>
              </Card>

              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-950/30 group hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Community Driven</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Powered by drivers like you, helping each other stay informed and safe on the roads.
                  </p>
                </div>
              </Card>

              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-950/30 group hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Safety First</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Help prevent accidents by sharing important road hazard information with your community.
                  </p>
                </div>
              </Card>

              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-950/30 group hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Analytics & Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    View detailed analytics and insights to understand road condition patterns and trends.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Enhanced How It Works Section */}
          <div className="mt-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Three simple steps to help make your community's roads safer
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-orange-300"></div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold shadow-2xl group-hover:scale-110 transition-all duration-300 relative z-10">
                    1
                  </div>
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Report an Issue</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Use our intuitive form to quickly report road conditions, accidents, or hazards with precise location data and photos.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-2xl font-bold shadow-2xl group-hover:scale-110 transition-all duration-300 relative z-10">
                    2
                  </div>
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Instant Alert</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Your report is immediately shared with the community and relevant authorities, creating instant awareness and response.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-bold shadow-2xl group-hover:scale-110 transition-all duration-300 relative z-10">
                    3
                  </div>
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Stay Informed</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Access real-time updates, interactive maps, and comprehensive analytics to stay informed about road conditions in your area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};