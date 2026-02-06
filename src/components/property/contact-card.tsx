"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  MessageCircle,
  Phone,
  Calendar,
  User,
  Send,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  inquirySchema,
  propertyVisitSchema,
  type InquiryFormData,
  type PropertyVisitFormData,
} from "@/lib/validations/inquiry";
import { PREFERRED_TIME_OPTIONS } from "@/types/forms";

const WHATSAPP_NUMBER = "919819446163";
const PHONE_NUMBER = "+91 98194 46163";

interface ContactCardProps {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  className?: string;
}

export function ContactCard({
  propertyId,
  propertyTitle,
  propertySlug,
  className,
}: ContactCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Quick inquiry form
  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      message: "",
      property_id: propertyId,
      inquiry_type: "property_specific",
    },
  });

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello! I'm interested in the property: ${propertyTitle}\n\nProperty Link: ${window.location.href}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleCallClick = () => {
    window.location.href = `tel:${WHATSAPP_NUMBER}`;
  };

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "inquiry" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit inquiry");
      }

      toast.success("Inquiry sent! We'll contact you soon.");
      form.reset();
      setSubmitError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send inquiry";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Contact Agent
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Trimurti Real Estate - 20+ years of trusted service
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Action Buttons */}
        <div className="grid gap-3">
          <Button
            size="lg"
            className="w-full bg-[#25D366] hover:bg-[#20BD5A]"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            WhatsApp
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={handleCallClick}
          >
            <Phone className="mr-2 h-5 w-5" />
            Call {PHONE_NUMBER}
          </Button>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="lg" variant="secondary" className="w-full">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Visit
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Schedule a Property Visit</SheetTitle>
                <SheetDescription>
                  Book a time to visit {propertyTitle}
                </SheetDescription>
              </SheetHeader>
              <ScheduleVisitForm
                propertyId={propertyId}
                propertyTitle={propertyTitle}
                onSuccess={() => setIsSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or send a message
            </span>
          </div>
        </div>

        {/* Quick Inquiry Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I'm interested in this property..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Inquiry
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Schedule Visit Form (inside Sheet)
interface ScheduleVisitFormProps {
  propertyId: string;
  propertyTitle: string;
  onSuccess: () => void;
}

function ScheduleVisitForm({
  propertyId,
  propertyTitle,
  onSuccess,
}: ScheduleVisitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyVisitFormData>({
    resolver: zodResolver(propertyVisitSchema),
    defaultValues: {
      property_id: propertyId,
      name: "",
      phone: "",
      email: "",
      preferred_date: undefined,
      preferred_time: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: PropertyVisitFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "visit" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to schedule visit");
      }

      toast.success("Visit request submitted! We'll confirm shortly.");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule visit"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable dates in the past
  const disabledDays = { before: new Date() };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferred_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Preferred Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(date?.toISOString().split("T")[0])
                    }
                    disabled={disabledDays}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferred_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Time</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PREFERRED_TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any specific requirements..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Request Visit"}
        </Button>
      </form>
    </Form>
  );
}

// Mobile Contact Bar - Fixed at bottom on mobile
interface MobileContactBarProps {
  propertyTitle: string;
  className?: string;
}

export function MobileContactBar({
  propertyTitle,
  className,
}: MobileContactBarProps) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello! I'm interested in the property: ${propertyTitle}\n\nProperty Link: ${window.location.href}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleCallClick = () => {
    window.location.href = `tel:${WHATSAPP_NUMBER}`;
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background p-4 shadow-lg",
        className
      )}
    >
      <div className="container mx-auto flex gap-3">
        <Button
          size="lg"
          className="flex-1 bg-[#25D366] hover:bg-[#20BD5A]"
          onClick={handleWhatsAppClick}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          WhatsApp
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={handleCallClick}
        >
          <Phone className="mr-2 h-5 w-5" />
          Call
        </Button>
      </div>
    </div>
  );
}
