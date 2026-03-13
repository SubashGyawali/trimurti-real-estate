"use client";

// Trust Badges Section - Displays key statistics with icons
// Shows years of experience, happy families, and buildings covered

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { trustStats } from "@/lib/data/landing-data";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// Inline counter component for trust badges
function AnimatedCounter({
  end,
  duration = 2000,
  className,
}: {
  end: number;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {count}
    </span>
  );
}

export function TrustBadgesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-white py-8 sm:py-16 md:py-20">
      {/* Subtle top shadow for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-4xl"
        >
          {/* Stats Grid - always 3 columns */}
          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            {trustStats.map((stat, index) => (
              <motion.div
                key={stat.id}
                variants={fadeInUp}
                className={cn(
                  "group relative flex flex-col items-center text-center",
                  // Divider between items on larger screens
                  index < trustStats.length - 1 &&
                    "sm:after:absolute sm:after:-right-4 sm:after:top-1/2 sm:after:h-16 sm:after:-translate-y-1/2 sm:after:w-px sm:after:bg-border"
                )}
              >
                {/* Icon - hidden on mobile for compactness */}
                {stat.icon && (
                  <div
                    className={cn(
                      "mb-2 flex h-10 w-10 items-center justify-center rounded-full sm:mb-4 sm:h-14 sm:w-14",
                      "bg-primary/10 text-primary",
                      "transition-transform duration-300 group-hover:scale-110"
                    )}
                  >
                    <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                )}

                {/* Counter */}
                <div className="flex items-baseline gap-0.5 sm:gap-1">
                  <AnimatedCounter
                    end={stat.end}
                    duration={2000 + index * 200}
                    className="font-plus-jakarta text-2xl font-bold text-foreground sm:text-4xl md:text-5xl"
                  />
                  <span className="font-plus-jakarta text-xl font-bold text-primary sm:text-3xl md:text-4xl">
                    {stat.suffix}
                  </span>
                </div>

                {/* Label */}
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:mt-2 sm:text-base">
                  {stat.label}
                </p>

                {/* Description - visible on hover, hidden on mobile */}
                {stat.description && (
                  <p className="mt-1 hidden text-sm text-muted-foreground/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
                    {stat.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
