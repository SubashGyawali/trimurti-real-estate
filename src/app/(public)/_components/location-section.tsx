"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Building2, Home, Building, CheckCircle2 } from "lucide-react";
import { PropertyMapContainer } from "@/components/maps";
import { cn } from "@/lib/utils";

const coveredAreas = [
  {
    icon: Building2,
    name: "MHADA 7-Storey Buildings",
    description: "53 buildings with affordable housing",
  },
  {
    icon: Building,
    name: "MHADA Towers",
    description: "24-storey high-rise towers",
  },
  {
    icon: Home,
    name: "Bhoomi Park",
    description: "Premium private complex",
  },
  {
    icon: Home,
    name: "Marina Enclave",
    description: "Modern residential society",
  },
  {
    icon: Home,
    name: "Dotam Tower",
    description: "Contemporary apartments",
  },
];

const highlights = [
  "Excellent connectivity to Western Express Highway",
  "Close to Kandivali Railway Station",
  "Multiple schools and hospitals nearby",
  "Active community with parks and amenities",
  "Affordable housing options for all budgets",
];

interface LocationSectionProps {
  className?: string;
}

export function LocationSection({ className }: LocationSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className={cn("overflow-hidden py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mx-auto mb-2 flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Kandivali West, Mumbai
            </span>
          </div>
          <h2 className="font-plus-jakarta text-3xl font-bold md:text-4xl">
            Our Service Area
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Located in the heart of Kandivali West, we specialize in properties
            within the MHADA complex and surrounding residential areas.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="overflow-hidden rounded-2xl border shadow-lg"
          >
            <PropertyMapContainer
              properties={[]}
              className="h-[400px] lg:h-full lg:min-h-[500px]"
              zoom={14}
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col justify-center"
          >
            {/* Covered Areas */}
            <div>
              <h3 className="font-plus-jakarta text-xl font-semibold">
                Areas We Cover
              </h3>
              <div className="mt-4 space-y-3">
                {coveredAreas.map((area, index) => (
                  <motion.div
                    key={area.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <area.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{area.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {area.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8"
            >
              <h3 className="font-plus-jakarta text-xl font-semibold">
                Why This Location?
              </h3>
              <ul className="mt-4 space-y-2">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
