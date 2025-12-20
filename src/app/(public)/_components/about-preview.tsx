"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Award, Users, MapPin, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trustIndicators = [
  {
    icon: Award,
    title: "20+ Years",
    description: "Local Expertise",
  },
  {
    icon: Users,
    title: "500+ Families",
    description: "Trusted Us",
  },
  {
    icon: MapPin,
    title: "Kandivali West",
    description: "Specialists",
  },
];

interface AboutPreviewProps {
  className?: string;
}

export function AboutPreview({ className }: AboutPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className={cn("bg-muted/30 py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Image/Photo Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Decorative frame */}
            <div className="relative mx-auto aspect-[4/3] max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10">
              {/* Placeholder content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-12 w-12 text-primary/40" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Photo of Mr. Niraj Koirala
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Founder, Trimurti Real Estate
                </p>
              </div>

              {/* Decorative border */}
              <div className="absolute inset-4 rounded-xl border-2 border-dashed border-primary/20" />
            </div>

            {/* Decorative elements */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute -bottom-4 -right-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-[hsl(var(--brand-gold))] text-white shadow-lg lg:-right-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold">20+</div>
                <div className="text-xs">Years</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-sm font-medium text-primary">About Us</span>
            <h2 className="mt-2 font-plus-jakarta text-3xl font-bold md:text-4xl">
              Your Trusted Partner in
              <br />
              <span className="text-primary">Kandivali Real Estate</span>
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              With over two decades of experience, Trimurti Real Estate has helped
              hundreds of families find their perfect home in the MHADA complex and
              surrounding areas of Kandivali West.
            </p>

            <p className="mt-4 leading-relaxed text-muted-foreground">
              Founded by Mr. Niraj Koirala, our agency specializes in resales and
              rentals within the 53 seven-storied MHADA buildings, 24-storey towers,
              and nearby private complexes. We understand the local market like no
              one else.
            </p>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {trustIndicators.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-2 font-semibold">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="mt-8"
            >
              <Button asChild size="lg" className="group">
                <Link href="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
