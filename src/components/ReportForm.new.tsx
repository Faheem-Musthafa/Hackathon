import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  category: z.enum(["accident", "construction", "weather", "traffic", "road_damage", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  reporter_name: z.string().min(2, "Name is required").optional(),
  reporter_email: z.string().email("Invalid email address").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onSuccess: () => void;
}

export const ReportForm = ({ onSuccess }: ReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "other",
      severity: "medium",
      reporter_name: "",
      reporter_email: "",
    }
  });

  const getLocation = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      form.setValue("latitude", position.coords.latitude);
      form.setValue("longitude", position.coords.longitude);
      
      // Attempt to get human-readable address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();
      if (data.display_name) {
        form.setValue("location", data.display_name);
      }
      
      toast({
        title: "Location detected",
        description: "Your current location has been added to the report.",
      });
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: "Error detecting location",
        description: "Please enter your location manually.",
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("reports")
        .insert([{
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category,
          severity: data.severity,
          reporter_name: data.reporter_name,
          reporter_email: data.reporter_email,
          latitude: data.latitude,
          longitude: data.longitude
        }]);

      if (error) throw error;

      toast({
        title: "Report submitted successfully!",
        description: "Thank you for helping keep our roads safe.",
      });

      form.reset();
      onSuccess();
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
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Submit Route Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                {...form.register("title")}
                id="title"
                placeholder="Brief description of the incident"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) => form.setValue("category", value as ReportFormData["category"])}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="road_damage">Road Damage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                onValueChange={(value) => form.setValue("severity", value as ReportFormData["severity"])}
                defaultValue={form.getValues("severity")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                  <SelectItem value="medium">Medium - Moderate impact</SelectItem>
                  <SelectItem value="high">High - Significant delays</SelectItem>
                  <SelectItem value="critical">Critical - Dangerous conditions</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.severity && (
                <p className="text-sm text-red-500">{form.formState.errors.severity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <Input
                  {...form.register("location")}
                  id="location"
                  placeholder="Enter location"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-10 px-0"
                  onClick={getLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.location && (
                <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...form.register("description")}
                id="description"
                placeholder="Detailed description of the incident"
                className="min-h-[100px]"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reporter_name">Your Name</Label>
                <Input
                  {...form.register("reporter_name")}
                  id="reporter_name"
                  placeholder="Enter your name"
                />
                {form.formState.errors.reporter_name && (
                  <p className="text-sm text-red-500">{form.formState.errors.reporter_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporter_email">Your Email</Label>
                <Input
                  {...form.register("reporter_email")}
                  id="reporter_email"
                  type="email"
                  placeholder="Enter your email"
                />
                {form.formState.errors.reporter_email && (
                  <p className="text-sm text-red-500">{form.formState.errors.reporter_email.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
