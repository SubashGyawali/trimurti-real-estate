"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { MessageSquare, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section
      ref={ref}
      className={cn(
        "relative overflow-hidden py-20 md:py-28",
        className
      )}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-blue))] via-[hsl(213,54%,22%)] to-[hsl(217,60%,18%)]" />

      {/* Animated background elements */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-[hsl(var(--brand-gold))]/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10"
          >
            <MessageSquare className="h-8 w-8 text-white" />
          </motion.div>

          {/* Heading */}
          <h2 className="font-plus-jakarta text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Looking for Something{" "}
            <span className="text-[hsl(var(--brand-gold))]">Specific?</span>
          </h2>

          {/* Description */}
          <p className="mt-6 text-lg text-white/80 md:text-xl">
            Tell us your requirements and we&apos;ll find the perfect property for
            you. Personalized service is our specialty.
          </p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70"
          >
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-gold))]" />
              Free Consultation
            </span>
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-gold))]" />
              No Obligation
            </span>
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-gold))]" />
              Expert Guidance
            </span>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="w-full bg-[hsl(var(--brand-gold))] text-white hover:bg-[hsl(var(--brand-gold))]/90 sm:w-auto"
            >
              <Link href="/contact?type=requirements">
                Tell Us Your Requirements
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
            >
              <Link href="/contact">
                <Phone className="mr-2 h-4 w-4" />
                Contact Us
              </Link>
            </Button>
          </motion.div>

          {/* Phone number */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-white/60"
          >
            Or call us directly at{" "}
            <a
              href="tel:+919876543210"
              className="font-medium text-white hover:text-[hsl(var(--brand-gold))]"
            >
              +91 98765 43210
            </a>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
