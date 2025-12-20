"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "Trimurti Real Estate made our home-buying journey smooth and stress-free. Their knowledge of the MHADA complex is unmatched. We found our dream 2BHK within our budget!",
    name: "Rajesh Sharma",
    location: "Building 23, MHADA Complex",
    initials: "RS",
    rating: 5,
  },
  {
    quote:
      "Professional service and genuine advice. They helped us find the perfect rental within our budget. The entire process from visit to agreement was handled efficiently.",
    name: "Priya Patel",
    location: "Bhoomi Park",
    initials: "PP",
    rating: 5,
  },
  {
    quote:
      "The documentation support was excellent. Everything was handled professionally and transparently. Mr. Koirala personally ensured all legal formalities were completed on time.",
    name: "Amit Kumar",
    location: "MHADA Tower",
    initials: "AK",
    rating: 5,
  },
  {
    quote:
      "As first-time home buyers, we had many questions and concerns. The team at Trimurti patiently guided us through every step. Highly recommended for anyone looking in Kandivali!",
    name: "Sneha Desai",
    location: "Marina Enclave",
    initials: "SD",
    rating: 5,
  },
  {
    quote:
      "We were looking for a rental for months with no luck. Trimurti found us the perfect flat within a week. Their local network and expertise really makes a difference.",
    name: "Mohammed Shaikh",
    location: "Building 45, MHADA Complex",
    initials: "MS",
    rating: 5,
  },
];

interface TestimonialsSectionProps {
  className?: string;
}

export function TestimonialsSection({ className }: TestimonialsSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className={cn("bg-muted/30 py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Quote className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-plus-jakarta text-3xl font-bold md:text-4xl">
            What Our Clients Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Don&apos;t just take our word for it. Here&apos;s what families we&apos;ve
            helped have to say about their experience with us.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 6000,
                stopOnInteraction: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full">
                    <CardContent className="flex h-full flex-col p-6">
                      {/* Stars */}
                      <div className="mb-4 flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]"
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="flex-1 text-muted-foreground">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>

                      {/* Author */}
                      <div className="mt-6 flex items-center gap-3 border-t pt-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {testimonial.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.location}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 hidden lg:flex" />
            <CarouselNext className="-right-4 hidden lg:flex" />
          </Carousel>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">
            <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
            <span>4.9/5 average rating from 100+ reviews</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
