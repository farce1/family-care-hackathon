"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import { Particles } from "@/components/ui/particles";
import { Heart, AlertCircle, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;
type ValidationErrors = Partial<Record<keyof OnboardingFormData, string>>;

export function OnboardingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 2;

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: ValidationErrors = {};

    if (step === 1) {
      // Validate basic info
      if (!formData.firstName || formData.firstName.length < 2) {
        stepErrors.firstName = "First name must be at least 2 characters";
      }
      if (!formData.lastName || formData.lastName.length < 2) {
        stepErrors.lastName = "Last name must be at least 2 characters";
      }
      if (!formData.email) {
        stepErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    // Validate entire form
    const result = onboardingSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof OnboardingFormData] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to save onboarding data
      console.log("Onboarding data:", result.data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to dashboard
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Onboarding failed:", error);
      setGeneralError(error instanceof Error ? error.message : "Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <Particles
        className="absolute inset-0 pointer-events-none"
        quantity={40}
        ease={70}
        color="oklch(0.64 0.08 245)"
        refresh={false}
      />

      <div className="relative z-10">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-primary fill-primary animate-pulse" />
            <TextAnimate
              animation="blurIn"
              by="word"
              className="text-4xl font-bold text-primary font-[family-name:var(--font-quicksand)]"
            >
              Welcome to Family Care
            </TextAnimate>
          </div>
          <TextAnimate
            animation="slideUp"
            by="word"
            delay={0.3}
            className="text-secondary text-lg"
          >
            Let&apos;s get to know you better
          </TextAnimate>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-secondary">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-border p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {generalError && (
              <div className="flex items-center gap-1.5 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-secondary text-sm font-medium">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`bg-white/70 border-border ${
                        errors.firstName ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
                      }`}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? "firstName-error" : undefined}
                    />
                    {errors.firstName && (
                      <div id="firstName-error" className="flex items-center gap-1.5 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.firstName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-secondary text-sm font-medium">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`bg-white/70 border-border ${
                        errors.lastName ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
                      }`}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? "lastName-error" : undefined}
                    />
                    {errors.lastName && (
                      <div id="lastName-error" className="flex items-center gap-1.5 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-secondary text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`bg-white/70 border-border ${
                      errors.email ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
                    }`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <div id="email-error" className="flex items-center gap-1.5 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-secondary text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-white/70 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-secondary text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="bg-white/70 border-border"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Additional Information */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Additional Information</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-secondary text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street, City, State 12345"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="bg-white/70 border-border"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-medium text-foreground mb-4">Emergency Contact</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-secondary text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contact Name
                      </Label>
                      <Input
                        id="emergencyContact"
                        type="text"
                        placeholder="Jane Doe"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        className="bg-white/70 border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone" className="text-secondary text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact Phone
                      </Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        placeholder="+1 (555) 987-6543"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                        className="bg-white/70 border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6"
              >
                Back
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="px-6 bg-gradient-to-r from-[oklch(0.64_0.08_245)] to-[oklch(0.87_0.03_230)] text-white hover:opacity-90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 bg-gradient-to-r from-[oklch(0.64_0.08_245)] to-[oklch(0.87_0.03_230)] text-white hover:opacity-90"
                >
                  {isLoading ? "Completing..." : "Complete Onboarding"}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
