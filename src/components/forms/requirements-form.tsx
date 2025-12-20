"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MessageCircle,
  Home,
  User,
  Building2,
  Wallet,
  Settings2,
  Send,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "./step-indicator";
import {
  requirementsFormSchema,
  defaultFormValues,
  step1Schema,
  step2Schema,
  step3Schema,
  PROPERTY_TYPE_OPTIONS,
  LISTING_TYPE_OPTIONS,
  FURNISHING_OPTIONS,
  FLOOR_PREFERENCE_OPTIONS,
  MOVE_IN_TIMELINE_OPTIONS,
  RENT_BUDGET,
  SALE_BUDGET,
  formatBudget,
  generateWhatsAppMessage,
  type RequirementsFormData,
} from "@/lib/validations/requirements";
import type { Building } from "@/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "requirements-form-data";
const WHATSAPP_NUMBER = "919876543210";

const STEPS = [
  { number: 1, label: "Basic Info", icon: User },
  { number: 2, label: "Property Type", icon: Home },
  { number: 3, label: "Budget", icon: Wallet },
  { number: 4, label: "Preferences", icon: Settings2 },
  { number: 5, label: "Confirm", icon: Check },
];

interface RequirementsFormProps {
  buildings: Building[];
}

export function RequirementsForm({ buildings }: RequirementsFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RequirementsFormData>({
    resolver: zodResolver(requirementsFormSchema) as any,
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  const watchListingType = form.watch("listing_type");
  const budgetConfig = watchListingType === "rent" ? RENT_BUDGET : SALE_BUDGET;

  // Restore from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        form.reset(data);
      } catch {
        // Invalid data, ignore
      }
    }
  }, [form]);

  // Save to session storage on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Update budget when listing type changes
  useEffect(() => {
    const currentMin = form.getValues("budget_min");
    const currentMax = form.getValues("budget_max");
    const config = watchListingType === "rent" ? RENT_BUDGET : SALE_BUDGET;

    // Reset to defaults if current values are outside new range
    if (currentMin < config.min || currentMin > config.max) {
      form.setValue("budget_min", config.min);
    }
    if (currentMax < config.min || currentMax > config.max) {
      form.setValue("budget_max", config.max);
    }
  }, [watchListingType, form]);

  const validateCurrentStep = async (): Promise<boolean> => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await form.trigger(["name", "phone", "email"]);
        break;
      case 2:
        isValid = await form.trigger(["listing_type", "property_types"]);
        break;
      case 3:
        isValid = await form.trigger(["budget_min", "budget_max"]);
        break;
      case 4:
        // All fields optional
        isValid = true;
        break;
      case 5:
        isValid = true;
        break;
      default:
        isValid = true;
    }

    return isValid;
  };

  const goToNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 5) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setDirection(-1);
      setCurrentStep(step);
    }
  };

  const onSubmit = async (data: RequirementsFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "requirements",
          name: data.name,
          phone: data.phone,
          email: data.email,
          inquiry_type: "requirements",
          requirements_data: {
            listing_type: data.listing_type,
            property_types: data.property_types,
            budget_min: data.budget_min,
            budget_max: data.budget_max,
            floor_preference: data.floor_preference,
            furnishing: data.furnishing,
            building_id: data.building_id || null,
            move_in_timeline: data.move_in_timeline,
            notes: data.notes,
            whatsapp_updates: data.whatsapp_updates,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit");
      }

      // Clear session storage
      sessionStorage.removeItem(STORAGE_KEY);
      setIsSuccess(true);
      setSubmitError(null);
      toast.success("Requirements submitted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const data = form.getValues();
    const message = generateWhatsAppMessage(data);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const resetForm = () => {
    form.reset(defaultFormValues);
    setCurrentStep(1);
    setIsSuccess(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
        >
          <Check className="h-10 w-10 text-green-600" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mt-6 font-plus-jakarta text-2xl font-bold">
            Thank You!
          </h2>
          <p className="mt-2 text-muted-foreground">
            We've received your requirements. Our team will contact you shortly
            with matching properties.
          </p>

          <div className="mt-8 space-y-4">
            <Button
              size="lg"
              className="w-full bg-[#25D366] hover:bg-[#128C7E]"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Continue on WhatsApp
            </Button>

            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href="/properties">
                <Building2 className="mr-2 h-5 w-5" />
                Browse Properties
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={resetForm}
            >
              Submit Another Request
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    const values = form.getValues();

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-plus-jakarta text-xl font-bold">
                Let's start with your details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll use this to contact you about matching properties
              </p>
            </div>

            <div className="space-y-4">
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-plus-jakarta text-xl font-bold">
                What are you looking for?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us the type of property you're interested in
              </p>
            </div>

            <div className="space-y-6">
              {/* Buy/Rent Toggle */}
              <div className="space-y-3">
                <Label>Looking to</Label>
                <RadioGroup
                  value={values.listing_type}
                  onValueChange={(value) =>
                    form.setValue("listing_type", value as "sale" | "rent")
                  }
                  className="grid grid-cols-2 gap-4"
                >
                  {LISTING_TYPE_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-all",
                        values.listing_type === option.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        className="sr-only"
                      />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Property Types */}
              <div className="space-y-3">
                <Label>
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {PROPERTY_TYPE_OPTIONS.map((option) => {
                    const isSelected = values.property_types?.includes(
                      option.value as any
                    );
                    return (
                      <Label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer items-center justify-center rounded-lg border-2 p-3 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const current = values.property_types || [];
                            if (checked) {
                              form.setValue("property_types", [
                                ...current,
                                option.value as any,
                              ]);
                            } else {
                              form.setValue(
                                "property_types",
                                current.filter((t) => t !== option.value)
                              );
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="font-medium">{option.label}</span>
                      </Label>
                    );
                  })}
                </div>
                {form.formState.errors.property_types && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.property_types.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-plus-jakarta text-xl font-bold">
                What's your budget?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set your preferred price range
              </p>
            </div>

            <div className="space-y-8">
              {/* Budget Display */}
              <div className="rounded-lg bg-primary/5 p-6 text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatBudget(values.budget_min, values.listing_type)} -{" "}
                  {formatBudget(values.budget_max, values.listing_type)}
                </div>
                {values.listing_type === "rent" && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    per month
                  </div>
                )}
              </div>

              {/* Dual Slider */}
              <div className="px-2">
                <Slider
                  value={[values.budget_min, values.budget_max]}
                  min={budgetConfig.min}
                  max={budgetConfig.max}
                  step={budgetConfig.step}
                  onValueChange={([min, max]) => {
                    form.setValue("budget_min", min);
                    form.setValue("budget_max", max);
                  }}
                  className="my-6"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {formatBudget(budgetConfig.min, values.listing_type)}
                  </span>
                  <span>
                    {formatBudget(budgetConfig.max, values.listing_type)}
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Quick select max budget:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {budgetConfig.presets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={
                        values.budget_max === preset ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        form.setValue("budget_max", preset);
                        if (values.budget_min > preset) {
                          form.setValue("budget_min", budgetConfig.min);
                        }
                      }}
                    >
                      {formatBudget(preset, values.listing_type)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-plus-jakarta text-xl font-bold">
                Any specific preferences?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These are optional but help us find better matches
              </p>
            </div>

            <div className="space-y-6">
              {/* Floor Preference */}
              <div className="space-y-3">
                <Label>Preferred Floor</Label>
                <div className="flex flex-wrap gap-2">
                  {FLOOR_PREFERENCE_OPTIONS.map((option) => {
                    const isSelected = values.floor_preference?.includes(
                      option.value as any
                    );
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = values.floor_preference || [];
                          if (isSelected) {
                            form.setValue(
                              "floor_preference",
                              current.filter((f) => f !== option.value)
                            );
                          } else {
                            form.setValue("floor_preference", [
                              ...current,
                              option.value as any,
                            ]);
                          }
                        }}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Furnishing */}
              <div className="space-y-3">
                <Label>Furnishing</Label>
                <Select
                  value={values.furnishing || ""}
                  onValueChange={(value) =>
                    form.setValue(
                      "furnishing",
                      value as RequirementsFormData["furnishing"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Building */}
              {buildings.length > 0 && (
                <div className="space-y-3">
                  <Label>Specific Building</Label>
                  <Select
                    value={values.building_id || ""}
                    onValueChange={(value) =>
                      form.setValue("building_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Move-in Timeline */}
              <div className="space-y-3">
                <Label>Move-in Timeline</Label>
                <RadioGroup
                  value={values.move_in_timeline || ""}
                  onValueChange={(value) =>
                    form.setValue(
                      "move_in_timeline",
                      value as RequirementsFormData["move_in_timeline"]
                    )
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  {MOVE_IN_TIMELINE_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm transition-all",
                        values.move_in_timeline === option.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        className="sr-only"
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific requirements or preferences..."
                  rows={3}
                  {...form.register("notes")}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-plus-jakarta text-xl font-bold">
                Review your requirements
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Make sure everything looks correct before submitting
              </p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              {/* Contact Info */}
              <Card>
                <CardContent className="flex items-start justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Contact Info
                    </div>
                    <div className="mt-1 font-medium">{values.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {values.phone}
                      {values.email && ` • ${values.email}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep(1)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Property Type */}
              <Card>
                <CardContent className="flex items-start justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Looking to {values.listing_type === "rent" ? "Rent" : "Buy"}
                    </div>
                    <div className="mt-1 font-medium">
                      {values.property_types
                        ?.map(
                          (t) =>
                            PROPERTY_TYPE_OPTIONS.find((o) => o.value === t)
                              ?.label
                        )
                        .join(", ")}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep(2)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Budget */}
              <Card>
                <CardContent className="flex items-start justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Budget
                    </div>
                    <div className="mt-1 font-medium">
                      {formatBudget(values.budget_min, values.listing_type)} -{" "}
                      {formatBudget(values.budget_max, values.listing_type)}
                      {values.listing_type === "rent" && "/month"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep(3)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Preferences (if any) */}
              {(values.floor_preference?.length ||
                values.furnishing ||
                values.building_id ||
                values.move_in_timeline ||
                values.notes) && (
                  <Card>
                    <CardContent className="flex items-start justify-between p-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">
                          Preferences
                        </div>
                        {values.floor_preference?.length ? (
                          <div className="text-sm">
                            Floor:{" "}
                            {values.floor_preference
                              .map(
                                (f) =>
                                  FLOOR_PREFERENCE_OPTIONS.find(
                                    (o) => o.value === f
                                  )?.label
                              )
                              .join(", ")}
                          </div>
                        ) : null}
                        {values.furnishing && (
                          <div className="text-sm">
                            Furnishing:{" "}
                            {
                              FURNISHING_OPTIONS.find(
                                (o) => o.value === values.furnishing
                              )?.label
                            }
                          </div>
                        )}
                        {values.building_id && (
                          <div className="text-sm">
                            Building:{" "}
                            {buildings.find((b) => b.id === values.building_id)
                              ?.name || values.building_id}
                          </div>
                        )}
                        {values.move_in_timeline && (
                          <div className="text-sm">
                            Timeline:{" "}
                            {
                              MOVE_IN_TIMELINE_OPTIONS.find(
                                (o) => o.value === values.move_in_timeline
                              )?.label
                            }
                          </div>
                        )}
                        {values.notes && (
                          <div className="text-sm text-muted-foreground">
                            "{values.notes}"
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToStep(4)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* WhatsApp Updates Checkbox */}
            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <Checkbox
                id="whatsapp_updates"
                checked={values.whatsapp_updates}
                onCheckedChange={(checked) =>
                  form.setValue("whatsapp_updates", !!checked)
                }
              />
              <Label
                htmlFor="whatsapp_updates"
                className="cursor-pointer text-sm"
              >
                Send me property updates on WhatsApp
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={goToStep}
          allowNavigation={true}
        />
      </div>

      {/* Form Content */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="min-h-[400px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStep === 1}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < 5 ? (
            <Button type="button" onClick={goToNext} className="flex-1">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
