import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertTriangle, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  category: z.string().min(1, "Category is required"),
  severity: z.string().min(1, "Severity is required"),
  reporter_name: z.string().min(2, "Name must be at least 2 characters"),
  reporter_email: z.string().email("Please enter a valid email"),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onSuccess: () => void;
}

export const ReportForm = ({ onSuccess }: ReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const getLocation = useCallback(async () => {
    // Prevent multiple simultaneous location requests
    if (locationLoading) {
      return;
    }
    
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation not supported",
          description: "Please enter your location manually.",
          variant: "destructive",
        });
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Geolocation request timed out'));
        }, 10000); // 10 second timeout

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            resolve(position);
          },
          (error) => {
            clearTimeout(timeoutId);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Add timeout for the reverse geocoding request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const address = data.display_name;
        setValue("location", address);
        toast({
          title: "Location detected",
          description: "Your location has been automatically filled.",
        });
      } catch (error) {
        console.error("Error getting address:", error);
        toast({
          title: "Location error",
          description: "Could not get address. Please enter manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('timeout')) {
        toast({
          title: "Location timeout",
          description: "Location request timed out. Please try again or enter manually.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('denied')) {
        toast({
          title: "Location access denied",
          description: "Please enable location services or enter your location manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Location error",
          description: "Please enter your location manually.",
          variant: "destructive",
        });
      }
    } finally {
      setLocationLoading(false);
    }
  }, [setValue, locationLoading]);

  const onSubmit = useCallback(async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reports").insert([
        {
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category,
          severity: data.severity,
          reporter_name: data.reporter_name,
          reporter_email: data.reporter_email,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Report submitted successfully!",
        description: "Your report has been shared with the community.",
      });

      setTimeout(() => {
        reset();
        setIsSuccess(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error submitting report",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [reset, onSuccess]);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Report Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for helping keep our community safe. Your report has been shared with other drivers.
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-6 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Report Road Issue</CardTitle>
            <p className="text-muted-foreground">
              Help keep our community safe by reporting road conditions, accidents, or hazards.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Brief description of the issue"
                  aria-describedby="title-error"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p id="title-error" className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Provide detailed information about the issue, including any relevant details that could help other drivers"
                  rows={4}
                  aria-describedby="description-error"
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p id="description-error" className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="Street address or intersection"
                    aria-describedby="location-error"
                    className={errors.location ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getLocation}
                    disabled={locationLoading}
                    className="shrink-0"
                    aria-label="Get current location"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.location && (
                  <p id="location-error" className="text-sm text-destructive">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Category and Severity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="weather">Weather Condition</SelectItem>
                      <SelectItem value="traffic">Traffic Jam</SelectItem>
                      <SelectItem value="hazard">Road Hazard</SelectItem>
                      <SelectItem value="maintenance">Road Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select onValueChange={(value) => setValue("severity", value)}>
                    <SelectTrigger id="severity" className={errors.severity ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.severity && (
                    <p className="text-sm text-destructive">{errors.severity.message}</p>
                  )}
                </div>
              </div>

              {/* Reporter Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporter_name">Your Name *</Label>
                  <Input
                    id="reporter_name"
                    {...register("reporter_name")}
                    placeholder="Your full name"
                    aria-describedby="reporter_name-error"
                    className={errors.reporter_name ? "border-destructive" : ""}
                  />
                  {errors.reporter_name && (
                    <p id="reporter_name-error" className="text-sm text-destructive">
                      {errors.reporter_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reporter_email">Email *</Label>
                  <Input
                    id="reporter_email"
                    type="email"
                    {...register("reporter_email")}
                    placeholder="your.email@example.com"
                    aria-describedby="reporter_email-error"
                    className={errors.reporter_email ? "border-destructive" : ""}
                  />
                  {errors.reporter_email && (
                    <p id="reporter_email-error" className="text-sm text-destructive">
                      {errors.reporter_email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </form>

            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50/50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Your report will be immediately shared with the community and emergency services if needed. 
                All information is kept confidential and used only for safety purposes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
