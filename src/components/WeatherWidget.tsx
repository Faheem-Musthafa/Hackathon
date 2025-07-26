import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  CloudDrizzle,
  Wind,
  Eye,
  Thermometer,
  Droplets,
  AlertTriangle,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  description: string;
  icon: string;
  alerts?: WeatherAlert[];
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  startTime: string;
  endTime: string;
}

interface WeatherWidgetProps {
  userLocation?: { lat: number; lng: number };
  className?: string;
}

const weatherIcons = {
  'clear': Sun,
  'sunny': Sun,
  'cloudy': Cloud,
  'overcast': Cloud,
  'rain': CloudRain,
  'drizzle': CloudDrizzle,
  'snow': CloudSnow,
  'fog': Cloud,
  'mist': Cloud,
  'default': Cloud
};

const alertSeverityColors = {
  minor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  moderate: 'bg-orange-100 text-orange-800 border-orange-300',
  severe: 'bg-red-100 text-red-800 border-red-300',
  extreme: 'bg-purple-100 text-purple-800 border-purple-300'
};

export function WeatherWidget({ userLocation, className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) {
      fetchWeatherData();
    } else {
      // Use default location (e.g., city center) if no user location
      fetchWeatherData();
    }
  }, [userLocation]);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate weather API call since we don't have a real API key
      // In a real implementation, you would use OpenWeatherMap, WeatherAPI, etc.
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      const mockWeatherData: WeatherData = {
        location: userLocation ? 'Your Location' : 'San Francisco, CA',
        temperature: Math.round(Math.random() * 30 + 10), // 10-40°C
        condition: ['clear', 'cloudy', 'rain', 'overcast'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
        visibility: Math.round(Math.random() * 5 + 5), // 5-10 km
        description: 'Partly cloudy with light winds',
        icon: 'cloudy',
        alerts: Math.random() > 0.7 ? [
          {
            id: '1',
            title: 'Heavy Rain Warning',
            description: 'Heavy rainfall expected in the next 2 hours. Drive with caution.',
            severity: 'moderate',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 7200000).toISOString() // 2 hours from now
          }
        ] : []
      };

      setWeather(mockWeatherData);
    } catch (err) {
      setError('Failed to fetch weather data');
      toast({
        title: "Weather Error",
        description: "Unable to fetch current weather conditions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const IconComponent = weatherIcons[condition as keyof typeof weatherIcons] || weatherIcons.default;
    return IconComponent;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-blue-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRoadConditionWarning = (weather: WeatherData) => {
    const warnings = [];
    
    if (weather.condition === 'rain' || weather.condition === 'drizzle') {
      warnings.push('Wet roads - Reduce speed and increase following distance');
    }
    if (weather.condition === 'snow') {
      warnings.push('Icy conditions possible - Use winter tires and drive carefully');
    }
    if (weather.condition === 'fog' || weather.visibility < 2) {
      warnings.push('Low visibility - Use fog lights and drive slowly');
    }
    if (weather.windSpeed > 50) {
      warnings.push('High winds - Be cautious of crosswinds, especially on bridges');
    }
    
    return warnings;
  };

  if (loading) {
    return (
      <Card className={`animate-pulse border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={`border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || 'Weather data unavailable'}
          </p>
          <Button 
            onClick={fetchWeatherData}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.condition);
  const roadWarnings = getRoadConditionWarning(weather);

  return (
    <Card className={`border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 backdrop-blur-xl shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <WeatherIcon className="w-5 h-5 text-blue-600" />
            Weather Conditions
          </CardTitle>
          <Button
            onClick={fetchWeatherData}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Weather Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon className="w-12 h-12 text-blue-600" />
            <div>
              <div className={`text-3xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                {weather.temperature}°C
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                {weather.condition}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-1">
              <MapPin className="w-3 h-3" />
              {weather.location}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {weather.description}
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <div className="font-medium text-gray-800 dark:text-gray-200">{weather.humidity}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
          </div>
          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Wind className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <div className="font-medium text-gray-800 dark:text-gray-200">{weather.windSpeed} km/h</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
          </div>
          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Eye className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <div className="font-medium text-gray-800 dark:text-gray-200">{weather.visibility} km</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Visibility</div>
          </div>
        </div>

        {/* Weather Alerts */}
        {weather.alerts && weather.alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Weather Alerts
            </h4>
            {weather.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${alertSeverityColors[alert.severity]}`}
              >
                <div className="font-medium text-sm">{alert.title}</div>
                <div className="text-xs mt-1">{alert.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Road Condition Warnings */}
        {roadWarnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Road Conditions
            </h4>
            {roadWarnings.map((warning, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800"
              >
                <div className="text-sm text-yellow-800 dark:text-yellow-200">{warning}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
