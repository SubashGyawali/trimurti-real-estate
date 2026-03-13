"use client";

// Hero Section V2 - Full-screen hero with cycling background images and cross-fade transitions
// Features: 10-second auto-cycle, random image selection, smooth 1-second cross-fade

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROPERTY_TYPE_OPTIONS } from "@/types/forms";
import { heroContent } from "@/lib/data/landing-data";
import { buildingImages, getNextRandomIndex } from "@/lib/data/building-images";
import { cn } from "@/lib/utils";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

// Image transition interval in milliseconds (10 seconds)
const IMAGE_CYCLE_INTERVAL = 10000;
// Cross-fade transition duration in seconds
const CROSSFADE_DURATION = 1;

export function HeroSectionV2() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [propertyType, setPropertyType] = useState<string>("");

  // Image carousel state - start with index 0 to avoid hydration mismatch
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Set random initial image on client mount only (prevents hydration mismatch)
  useEffect(() => {
    setCurrentImageIndex(Math.floor(Math.random() * buildingImages.length));
  }, []);

  // Auto-cycle through images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => getNextRandomIndex(prevIndex));
    }, IMAGE_CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const currentImage = buildingImages[currentImageIndex];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (listingType) params.set("listing", listingType);
    if (propertyType) params.set("types", propertyType);
    router.push(`/properties?${params.toString()}`);
  };

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative -mt-16 min-h-screen overflow-hidden md:-mt-20">
      {/* Background Images Container with Cross-Fade */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: CROSSFADE_DURATION, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              quality={85}
            />
          </motion.div>
        </AnimatePresence>

        {/* Glass blur effect - lighter blur, wider gradient starting more right */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(10px) saturate(100%)",
            WebkitBackdropFilter: "blur(12px) saturate(150%)",
            maskImage:
              "linear-gradient(to right, black 0%, black 20%, transparent 65%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black 20%, transparent 65%)",
          }}
        />
        {/* Gradient tint for text contrast - wider and more gradual */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.1) 55%, transparent 80%)",
          }}
        />
        {/* Subtle vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15 pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="container relative z-10 mx-auto flex min-h-screen flex-col justify-center px-4 py-20 lg:py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-2xl lg:max-w-3xl"
        >
          {/* Badge */}
          {heroContent.badge && (
            <motion.div variants={fadeInLeft} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                <Building className="h-4 w-4" />
                {heroContent.badge}
              </span>
            </motion.div>
          )}

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="font-plus-jakarta text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {heroContent.title}
            <br />
            <span className="text-[hsl(var(--brand-gold))]">
              {heroContent.highlightedText}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl"
          >
            {heroContent.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="gap-2 bg-[hsl(var(--brand-gold))] px-8 text-white hover:bg-[hsl(var(--brand-gold))]/90"
              onClick={() => router.push(heroContent.primaryCta.href)}
            >
              {heroContent.primaryCta.text}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              onClick={() => router.push(heroContent.secondaryCta.href)}
            >
              {heroContent.secondaryCta.text}
            </Button>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={fadeInUp} className="mt-10 max-w-xl">
            <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-md">
              <div
                className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-2xl sm:flex-row sm:items-center"
                suppressHydrationWarning
              >
                {/* Listing Type Tabs */}
                <Tabs
                  value={listingType}
                  onValueChange={(v) => setListingType(v as "rent" | "sale")}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2 sm:w-[160px]">
                    <TabsTrigger value="rent">Rent</TabsTrigger>
                    <TabsTrigger value="sale">Buy</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Property Type Select */}
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full border-0 bg-muted/50 sm:w-[160px]">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="w-full gap-2 sm:w-auto"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={fadeInUp}
            className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/70"
          >
            <span>Popular:</span>
            <QuickSearchButton
              label="2 BHK for Rent"
              onClick={() => {
                setListingType("rent");
                setPropertyType("2bhk");
              }}
            />
            <QuickSearchButton
              label="1 BHK for Sale"
              onClick={() => {
                setListingType("sale");
                setPropertyType("1bhk");
              }}
            />
            <QuickSearchButton
              label="1 RK for Rent"
              onClick={() => {
                setListingType("rent");
                setPropertyType("1rk");
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 cursor-pointer"
        aria-label="Scroll to content"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/50 transition-colors hover:text-white/80"
        >
          <span className="text-xs tracking-wider uppercase">Explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.button>

      {/* Image indicator dots (optional, shows which image is active) */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:flex items-center gap-1.5">
        {buildingImages.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              currentImageIndex === index
                ? "bg-white w-6"
                : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={`View image ${index + 1}`}
          />
        ))}
        {buildingImages.length > 5 && (
          <span className="ml-1 text-xs text-white/40">
            +{buildingImages.length - 5}
          </span>
        )}
      </div>
    </section>
  );
}

// Quick search button component
function QuickSearchButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border border-white/20 px-3 py-1.5",
        "transition-all duration-200",
        "hover:border-white/40 hover:bg-white/10 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}
