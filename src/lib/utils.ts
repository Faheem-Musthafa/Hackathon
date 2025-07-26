import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for report data
export const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'accident': return '🚗';
    case 'construction': return '🚧';
    case 'weather': return '🌧️';
    case 'traffic': return '🚦';
    case 'road_damage': return '🕳️';
    default: return '⚠️';
  }
};

export const getSeverityVariant = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'secondary';
  }
};

export const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'accident': return 'text-red-500';
    case 'construction': return 'text-yellow-500';
    case 'weather': return 'text-blue-500';
    case 'traffic': return 'text-orange-500';
    case 'road_damage': return 'text-purple-500';
    default: return 'text-gray-500';
  }
};

export const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const openInMaps = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, '_blank');
};
