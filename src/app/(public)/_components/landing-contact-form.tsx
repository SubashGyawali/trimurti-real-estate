"use client";

// Landing Contact Form - Inline contact form with validation
// Split layout: Form on left, contact info on right

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { contactInfo } from "@/lib/data/landing-data";
import { cn } from "@/lib/utils";

// Validation schema
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit Indian mobile number"
    ),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  message: z.string().max(500, "Message is too long").optional().or(z.literal("")),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function LandingContactForm() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          inquiry_type: "general",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      setIsSubmitted(true);
      toast.success("Thank you! We'll get back to you soon.");
      reset();

      // Reset success state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-primary">
            Get in Touch
          </span>
          <h2 className="font-plus-jakarta text-3xl font-bold text-foreground md:text-4xl">
            Ready to Find Your Dream Home?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Leave your details and we&apos;ll get back to you within 24 hours.
            Or reach out directly via phone or WhatsApp.
          </p>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2"
        >
          {/* Form */}
          <div
            className={cn(
              "rounded-xl bg-white p-6 md:p-8",
              "border border-gray-100 shadow-sm"
            )}
          >
            {isSubmitted ? (
              <SuccessMessage />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    {...register("name")}
                    className={cn(errors.name && "border-destructive")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      {...register("phone")}
                      className={cn(
                        "rounded-l-none",
                        errors.phone && "border-destructive"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register("email")}
                    className={cn(errors.email && "border-destructive")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your requirements..."
                    rows={4}
                    {...register("message")}
                    className={cn(errors.message && "border-destructive")}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By submitting, you agree to receive communications from us.
                </p>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-6">
            {/* WhatsApp CTA */}
            <div
              className={cn(
                "rounded-xl bg-[#25D366] p-6 text-white",
                "shadow-lg shadow-[#25D366]/20"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Prefer WhatsApp?</h3>
                  <p className="mt-1 text-sm text-white/80">
                    Get instant responses on WhatsApp
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="mt-3 bg-white text-[#25D366] hover:bg-white/90"
                  >
                    <Link
                      href={`https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent("Hello! I'm interested in properties in Kandivali West.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chat on WhatsApp
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <ContactItem
                icon={Phone}
                label="Phone"
                value={contactInfo.phone}
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
              />
              <ContactItem
                icon={Mail}
                label="Email"
                value={contactInfo.email}
                href={`mailto:${contactInfo.email}`}
              />
              <ContactItem
                icon={MapPin}
                label="Address"
                value={contactInfo.address}
                href={contactInfo.googleMapsUrl}
              />
              <ContactItem
                icon={Clock}
                label="Working Hours"
                value={contactInfo.workingHours}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Contact Item Component
interface ContactItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}

function ContactItem({ icon: Icon, label, value, href }: ContactItemProps) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block transition-opacity hover:opacity-80"
      >
        {content}
      </Link>
    );
  }

  return content;
}

// Success Message Component
function SuccessMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle className="h-8 w-8 text-emerald-600" />
      </div>
      <h3 className="font-plus-jakarta text-xl font-semibold text-foreground">
        Message Sent Successfully!
      </h3>
      <p className="mt-2 text-muted-foreground">
        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
      </p>
    </div>
  );
}
