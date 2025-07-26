import { MapPin, Mail, Phone, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">RouteReport</h3>
                <p className="text-sm text-muted-foreground">Live</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time road condition reporting platform helping communities stay safe and informed.
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Report an Issue
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  View Reports
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Analytics
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Map View
                </Button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@routereport.com</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>1-800-ROUTE-HELP</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="font-semibold">Community</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join thousands of drivers helping each other stay safe on the roads.
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with love for safer roads</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2024 RouteReport Live. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Terms of Service</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}; 