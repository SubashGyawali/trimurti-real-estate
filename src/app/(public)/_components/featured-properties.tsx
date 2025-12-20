"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property";
import type { PropertyWithImages } from "@/types";
import { cn } from "@/lib/utils";

interface FeaturedPropertiesProps {
  properties: PropertyWithImages[];
  className?: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturedProperties({
  properties,
  className,
}: FeaturedPropertiesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // If no properties, show placeholder
  if (!properties || properties.length === 0) {
    return (
      <section
        ref={ref}
        className={cn("bg-muted/30 py-16 md:py-24", className)}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 font-plus-jakarta text-3xl font-bold md:text-4xl">
              Featured Properties
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our featured listings will appear here soon.
              <br />
              Check back for premium properties in the MHADA complex.
            </p>
            <Button asChild className="mt-6">
              <Link href="/properties">
                Browse All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={cn("bg-muted/30 py-16 md:py-24", className)}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[hsl(var(--brand-gold))]" />
              <span className="text-sm font-medium text-[hsl(var(--brand-gold))]">
                Handpicked for you
              </span>
            </div>
            <h2 className="font-plus-jakarta text-3xl font-bold md:text-4xl">
              Featured Properties
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover our premium listings in Kandivali West
            </p>
          </div>
          <Button asChild variant="outline" className="group">
            <Link href="/properties">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {properties.map((property) => (
                <CarouselItem
                  key={property.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <PropertyCard property={property} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 hidden md:flex" />
            <CarouselNext className="-right-4 hidden md:flex" />
          </Carousel>
        </motion.div>

        {/* Mobile CTA */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center md:hidden"
        >
          <Button asChild>
            <Link href="/properties">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
