"use client";

// Features Section - 2x2 grid of feature tiles with icons
// Highlights key value propositions: Local Expertise, Documentation, Verified Listings, Personal Touch

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { features } from "@/lib/data/landing-data";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Why Choose Us
          </span>
          <h2 className="font-plus-jakarta text-3xl font-bold text-foreground md:text-4xl">
            What Makes Us Different
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            With over 20 years of experience in Kandivali West, we bring
            unmatched expertise and dedication to help you find your perfect
            home.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Feature Card Component
interface FeatureCardProps {
  feature: (typeof features)[0];
}

function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "group relative rounded-xl bg-white p-6 md:p-8",
        "border border-gray-100 shadow-sm",
        "transition-all duration-300",
        "hover:border-primary/20 hover:shadow-md"
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "mb-5 flex h-14 w-14 items-center justify-center rounded-xl",
          feature.color || "bg-primary/10 text-primary",
          "transition-transform duration-300 group-hover:scale-110"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Title */}
      <h3 className="mb-3 font-plus-jakarta text-xl font-semibold text-foreground">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="leading-relaxed text-muted-foreground">
        {feature.description}
      </p>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 rounded-b-xl bg-primary transition-all duration-300 group-hover:w-full" />
    </motion.div>
  );
}
