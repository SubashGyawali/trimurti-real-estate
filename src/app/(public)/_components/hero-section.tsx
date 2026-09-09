"use client";

// Hero Section V3 – Redesigned to match the premium real-estate landing mockup.
// Features:
// - Full-bleed background image carousel (10-second auto-cycle, 1-second cross-fade)
// - "SINCE 2004" badge, location markers, vertical sidebar words
// - Search bar with Rent/Buy tabs & property type selector
// - Stats row (experience, families, specialty, trust)
// - Bottom tagline "Mumbai Lives Better Here" + slide counter & arrows

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Home,
  Users,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_OPTIONS } from "@/types/forms";
import {
  type BuildingImage,
  DEFAULT_BUILDING_IMAGES,
  getNextRandomIndex,
} from "@/lib/data/building-images";
import { cn } from "@/lib/utils";

// ─── constants ──────────────────────────────────────────────
const IMAGE_CYCLE_INTERVAL = 10_000;
const CROSSFADE_DURATION = 1;

// For the slide counter we always show groups of 3
const SLIDES_PER_GROUP = 3;

// Vertical sidebar words
const SIDEBAR_WORDS = [
  "HOMES",
  "COMMUNITIES",
  "CONNECTIONS",
  "BRIGHTER",
  "TOMORROWS",
];

// Stats row data
const HERO_STATS = [
  {
    icon: Home,
    value: "20+",
    label: "Years Experience",
  },
  {
    icon: Users,
    value: "500+",
    label: "Happy Families",
  },
  {
    icon: MapPin,
    value: "Kandivali &",
    sublabel: "Malad West",
    label: "Our Specialty",
  },
  {
    icon: ShieldCheck,
    value: "Transparent",
    sublabel: "& Genuine Deals",
    label: "Always",
  },
];

// ─── animation variants ─────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// ─── component ───────────────────────────────────────────────
interface HeroSectionProps {
  images?: BuildingImage[];
}

export function HeroSection({ images }: HeroSectionProps) {
  const router = useRouter();

  // Use passed images or fallback to defaults
  const heroImages =
    images && images.length > 0 ? images : DEFAULT_BUILDING_IMAGES;

  // Search state
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [propertyType, setPropertyType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(Math.floor(Math.random() * heroImages.length));
  }, [heroImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        getNextRandomIndex(prev, heroImages)
      );
    }, IMAGE_CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [heroImages]);

  const currentImage = heroImages[currentImageIndex] ?? heroImages[0];

  const goNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  const goPrev = useCallback(() => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  }, [heroImages.length]);

  // Slide counter (1-indexed, grouped)
  const slideNumber = (currentImageIndex % SLIDES_PER_GROUP) + 1;
  const slideDisplay = String(slideNumber).padStart(2, "0");

  const getSearchHref = useCallback(() => {
    const params = new URLSearchParams();
    if (listingType) params.set("listing", listingType);
    if (propertyType) params.set("types", propertyType);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    return `/properties?${params.toString()}`;
  }, [listingType, propertyType, searchQuery]);

  const prefetchSearch = useCallback(() => {
    router.prefetch(getSearchHref());
  }, [getSearchHref, router]);

  const handleSearch = () => {
    router.push(getSearchHref());
  };

  return (
    <section className="relative -mt-16 min-h-screen overflow-hidden md:-mt-20">
      {/* ═══════ Background Image Carousel ═══════ */}
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
              unoptimized={currentImage.src.startsWith("http")}
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/30 via-transparent to-[#0a1628]/10" />
      </div>

      {/* ═══════ Content ═══════ */}
      <div className="container relative z-10 mx-auto flex min-h-screen flex-col justify-between px-4 pb-6 pt-24 lg:px-8 lg:pt-28">
        {/* Top area – headline + badge + search */}
        <div className="flex flex-1 items-start pt-4 lg:pt-8">
          {/* Left column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-2xl"
          >
            {/* Trusted badge */}
            <motion.p
              variants={fadeInUp}
              className="mb-2 flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase"
            >
              TRUSTED IN MUMBAI REAL ESTATE
              <span className="inline-block h-px w-16 bg-gray-400" />
            </motion.p>

            {/* Main heading */}
            <motion.h1 variants={fadeInUp} className="leading-none">
              <span className="font-playfair text-4xl font-bold text-[#0a1628] sm:text-5xl md:text-6xl lg:text-7xl">
                Find Your
              </span>
              <br />
              <span className="font-playfair text-5xl font-extrabold text-[#0a1628] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                Next Chapter
              </span>
              <br />
              <span className="mt-2 inline-block font-playfair text-2xl font-normal italic text-[#0a1628]/80 sm:text-3xl md:text-4xl">
                in Kandivali &amp; Malad West
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="mt-5 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base"
            >
              500+ families settled. Every deal, face-to-face.
              <br />
              Two decades of honest real estate in Kandivali &amp; Malad West.
            </motion.p>

            {/* ─── Search Bar ─── */}
            <motion.form
              variants={fadeInUp}
              onMouseEnter={prefetchSearch}
              onFocusCapture={prefetchSearch}
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
              className="mt-7 w-fit max-w-full"
            >
              <div
                className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl sm:flex-row sm:items-center"
                suppressHydrationWarning
              >
                {/* Rent / Buy toggle */}
                <div className="flex shrink-0 overflow-hidden rounded-lg border border-gray-200">
                  <button
                    onClick={() => setListingType("rent")}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors",
                      listingType === "rent"
                        ? "bg-white text-[#0a1628]"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    Rent
                  </button>
                  <button
                    onClick={() => setListingType("sale")}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors",
                      listingType === "sale"
                        ? "bg-white text-[#0a1628]"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    Buy
                  </button>
                </div>

                <motion.div
                  className="relative shrink-0"
                  animate={{ width: isSearchExpanded ? 200 : 42 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.7 }}
                  onMouseEnter={() => setIsSearchExpanded(true)}
                  onMouseLeave={() => {
                    if (!searchQuery) setIsSearchExpanded(false);
                  }}
                >
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={isSearchExpanded ? "Area, building or property" : ""}
                    aria-label="Search properties by area, building, or name"
                    onFocus={() => setIsSearchExpanded(true)}
                    onBlur={() => {
                      if (!searchQuery) setIsSearchExpanded(false);
                    }}
                    className="h-10 w-full border-gray-200 bg-gray-50 pl-9 text-sm shadow-none focus-visible:ring-[#1a4b8c]/30"
                  />
                </motion.div>

                {/* Property type */}
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full shrink-0 border-0 bg-transparent text-sm sm:w-[140px]">
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

                {/* Search button */}
                <Button
                  type="submit"
                  className="shrink-0 gap-2 bg-[#1a4b8c] px-5 hover:bg-[#153d73]"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Popular searches */}
            <motion.div
              variants={fadeInUp}
              className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500"
            >
              <span className="mr-1 font-medium">Popular Searches:</span>
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

            {/* ─── Stats Row ─── */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-wrap items-start gap-6 lg:gap-8"
            >
              {HERO_STATS.map((stat, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1a4b8c]">
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-[#0a1628]">
                      {stat.value}
                    </p>
                    {stat.sublabel && (
                      <p className="text-sm font-bold text-[#0a1628]">
                        {stat.sublabel}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ─── "SINCE 2004" Badge (desktop) ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="ml-6 mt-2 hidden shrink-0 flex-col items-center lg:flex"
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm">
              <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Since
              </span>
              <span className="font-playfair text-4xl font-bold text-[#0a1628]">
                2004
              </span>
              <span className="mt-0.5 text-center text-[9px] font-semibold leading-tight tracking-wider text-gray-400 uppercase">
                Building
                <br />
                Better Lives
              </span>
            </div>
          </motion.div>
        </div>

        {/* ─── Location Labels (floating over background, desktop only) ─── */}
        <div className="pointer-events-none absolute top-1/3 right-[30%] z-20 hidden xl:block">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center"
          >
            <MapPin className="mx-auto mb-1 h-4 w-4 text-white/80" />
            <p className="text-xs font-bold tracking-wider text-white drop-shadow-lg uppercase">
              Kandivali
            </p>
            <p className="text-[9px] tracking-wider text-white/70 uppercase">
              A Vibrant Community
            </p>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute top-[30%] right-[12%] z-20 hidden xl:block">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-xs font-bold tracking-wider text-white drop-shadow-lg uppercase">
              Malad West
            </p>
            <p className="text-[9px] tracking-wider text-white/70 uppercase">
              Endless Possibilities
            </p>
          </motion.div>
        </div>

        {/* ─── Vertical Sidebar Words (desktop only) ─── */}
        <div className="pointer-events-none absolute top-1/4 right-4 z-20 hidden flex-col items-end gap-3 xl:flex">
          {SIDEBAR_WORDS.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
              className="text-[11px] font-medium tracking-[0.2em] text-white/60"
            >
              {word}
            </motion.span>
          ))}
          <span className="mt-1 h-10 w-px bg-white/30" />
        </div>

        {/* ═══════ Bottom Bar ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-auto flex flex-col items-start justify-between gap-4 border-t border-white/20 pt-5 sm:flex-row sm:items-end"
        >
          {/* Left – Mumbai tagline */}
          <div className="flex items-end gap-4">
            <div>
              <p className="font-playfair text-2xl italic text-[#0a1628] sm:text-3xl">
                Mumbai
              </p>
              <p className="font-playfair text-lg italic text-[#0a1628]/70 sm:text-xl">
                Lives Better Here
              </p>
            </div>
            <span className="mb-1 h-10 w-px bg-gray-300" />
            <div className="mb-1">
              <p className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase">
                More than properties.
              </p>
              <p className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase">
                We build futures.
              </p>
            </div>
          </div>

          {/* Right – Slide nav */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/80 drop-shadow">
              {slideDisplay}{" "}
              <span className="text-white/40">
                / {String(SLIDES_PER_GROUP).padStart(2, "0")}
              </span>
            </span>
            <button
              onClick={goPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#1a4b8c] text-white transition-colors hover:bg-[#153d73]"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Quick search chip ──────────────────────────────────────
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
        "rounded-full border border-gray-300 px-3 py-1 text-xs",
        "transition-all duration-200",
        "hover:border-gray-400 hover:bg-gray-50"
      )}
    >
      {label}
    </button>
  );
}
