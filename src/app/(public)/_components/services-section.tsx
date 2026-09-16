"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Home, Key, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Home,
    title: "Property Sales",
    description:
      "Find your dream home with our curated selection of apartments and shops in prime Kandivali locations. Expert guidance through every step of the buying process.",
    color: "text-status-success",
    bgColor: "bg-status-success/10",
  },
  {
    icon: Key,
    title: "Rental Services",
    description:
      "Discover quality rental properties that match your budget and lifestyle preferences. Wide range of options from 1 RK to 3 BHK apartments.",
    color: "text-status-info",
    bgColor: "bg-status-info/10",
  },
  {
    icon: FileText,
    title: "Documentation Help",
    description:
      "Hassle-free documentation support for property registration, agreements, and legal formalities. We handle the paperwork so you don't have to.",
    color: "text-status-warning",
    bgColor: "bg-status-warning/10",
  },
];

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

interface ServicesSectionProps {
  className?: string;
}

export function ServicesSection({ className }: ServicesSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="text-sm font-medium text-primary">What We Offer</span>
          <h2 className="mt-2 font-plus-jakarta text-3xl font-bold md:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-muted-foreground">
            Comprehensive real estate solutions tailored to your needs.
            From finding the perfect property to handling all documentation.
          </p>
        </motion.div>

        {/* Service Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-6 md:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div key={service.title} variants={fadeInUp}>
              <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                      service.bgColor
                    )}
                  >
                    <service.icon className={cn("h-7 w-7", service.color)} />
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 font-plus-jakarta text-xl font-semibold">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="mt-5 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span>Learn more</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
