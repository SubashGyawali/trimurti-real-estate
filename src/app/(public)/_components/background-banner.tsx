"use client";

// Background Banner - Full-width CTA section with random building image background
// Image changes only on page refresh (not cycling like hero)

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ctaBannerContent } from "@/lib/data/landing-data";
import { buildingImages } from "@/lib/data/building-images";
import { cn } from "@/lib/utils";

export function BackgroundBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Random building image - selected once on mount, only changes on page refresh
  const [randomImage] = useState(() =>
    buildingImages[Math.floor(Math.random() * buildingImages.length)]
  );

  // Parallax effect for background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-20 md:py-28"
    >
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 -z-10" style={{ y }}>
        <Image
          src={randomImage.src}
          alt={randomImage.alt}
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={80}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70" />
      </motion.div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Title */}
          <h2 className="font-plus-jakarta text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {ctaBannerContent.title}
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            {ctaBannerContent.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className={cn(
                "gap-2 bg-[hsl(var(--accent))] px-8 text-white",
                "hover:bg-[hsl(var(--accent))]/90",
                "shadow-lg shadow-black/20"
              )}
            >
              <Link href={ctaBannerContent.cta.href}>
                {ctaBannerContent.cta.text}
              </Link>
            </Button>

            {ctaBannerContent.secondaryCta && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className={cn(
                  "gap-2 border-white/30 bg-white/10 text-white",
                  "backdrop-blur-sm",
                  "hover:bg-white/20 hover:text-white"
                )}
              >
                <Link href={ctaBannerContent.secondaryCta.href}>
                  <Phone className="h-4 w-4" />
                  {ctaBannerContent.secondaryCta.text}
                </Link>
              </Button>
            )}
          </div>

          {/* Trust indicator */}
          <p className="mt-6 text-sm text-white/60">
            No obligation, no pressure. Just honest advice.
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  );
}
