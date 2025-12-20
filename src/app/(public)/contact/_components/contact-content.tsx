"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  contactFormSchema,
  SUBJECT_OPTIONS,
  type ContactFormData,
} from "@/lib/validations/contact";
import { OfficeMap } from "./office-map";

const CONTACT_INFO = {
  phone: "+919876543210",
  phoneDisplay: "+91 98765 43210",
  whatsapp: "919876543210",
  email: "info@trimurtirealestate.com",
  address: "Shop No. 5, MHADA Colony, Kandivali West, Mumbai - 400067",
  hours: "Open 7 Days a Week",
  hoursDetail: "9:00 AM - 8:00 PM",
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function ContactContent() {
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const formInView = useInView(formRef, { once: true, margin: "-100px" });
  const infoInView = useInView(infoRef, { once: true, margin: "-100px" });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: "general",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "contact" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      toast.success("Message sent! We'll get back to you soon.");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hello! I'm interested in your real estate services."
    );
    window.open(
      `https://wa.me/${CONTACT_INFO.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  const handleCallClick = () => {
    window.location.href = `tel:${CONTACT_INFO.phone}`;
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand-blue))] to-primary py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5" />
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-plus-jakarta text-4xl font-bold text-white md:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-white/80">
              We're here to help you find your perfect home
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <motion.div
              ref={formRef}
              initial="initial"
              animate={formInView ? "animate" : "initial"}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-2xl bg-background p-6 shadow-lg md:p-8">
                <h2 className="font-plus-jakarta text-2xl font-bold">
                  Send us a Message
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Fill out the form below and we'll get back to you shortly.
                </p>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-8 space-y-6"
                >
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...form.register("name")}
                      aria-invalid={!!form.formState.errors.name}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      {...form.register("phone")}
                      aria-invalid={!!form.formState.errors.phone}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...form.register("email")}
                      aria-invalid={!!form.formState.errors.email}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {(form.formState.errors.email as any)?.message ?? String(form.formState.errors.email)}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.watch("subject")}
                      onValueChange={(value) =>
                        form.setValue(
                          "subject",
                          value as ContactFormData["subject"]
                        )
                      }
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.subject && (
                      <p className="text-sm text-destructive">
                        {(form.formState.errors.subject as any)?.message ?? String(form.formState.errors.subject)}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={4}
                      {...form.register("message")}
                      aria-invalid={!!form.formState.errors.message}
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm text-destructive">
                        {(form.formState.errors.message as any)?.message ?? String(form.formState.errors.message)}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              ref={infoRef}
              initial="initial"
              animate={infoInView ? "animate" : "initial"}
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Quick Actions */}
              <div className="rounded-2xl bg-muted/30 p-6 md:p-8">
                <h2 className="font-plus-jakarta text-2xl font-bold">
                  Get in Touch Instantly
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Prefer a quick chat? Reach us directly!
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Button
                    size="lg"
                    className="h-auto bg-[#25D366] py-4 hover:bg-[#128C7E]"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">WhatsApp</div>
                      <div className="text-xs opacity-80">Chat with us</div>
                    </div>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-auto py-4"
                    onClick={handleCallClick}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Call Us</div>
                      <div className="text-xs opacity-80">
                        {CONTACT_INFO.phoneDisplay}
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="rounded-2xl bg-background p-6 shadow-lg md:p-8">
                <h2 className="font-plus-jakarta text-xl font-bold">
                  Contact Information
                </h2>

                <div className="mt-6 space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Office Address</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {CONTACT_INFO.address}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Phone</div>
                      <a
                        href={`tel:${CONTACT_INFO.phone}`}
                        className="mt-1 block text-sm text-muted-foreground hover:text-primary"
                      >
                        {CONTACT_INFO.phoneDisplay}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <a
                        href={`mailto:${CONTACT_INFO.email}`}
                        className="mt-1 block text-sm text-muted-foreground hover:text-primary"
                      >
                        {CONTACT_INFO.email}
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Business Hours</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {CONTACT_INFO.hours}
                        <br />
                        {CONTACT_INFO.hoursDetail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="overflow-hidden rounded-2xl">
                <OfficeMap />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
