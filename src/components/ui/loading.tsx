import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const Loading = ({ size = "md", text, className }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

export const LoadingSpinner = ({ size = "md", className }: Omit<LoadingProps, "text">) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
  );
}; 