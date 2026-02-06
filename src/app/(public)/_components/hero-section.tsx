"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Home, Building } from "lucide-react";
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
import { StatsGrid } from "./stats-counter";
import { cn } from "@/lib/utils";

const stats = [
  { end: 20, suffix: "+", label: "Years Experience" },
  { end: 500, suffix: "+", label: "Happy Families" },
  { end: 53, suffix: "", label: "Buildings Covered" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
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

export function HeroSection() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [propertyType, setPropertyType] = useState<string>("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (listingType) params.set("listing", listingType);
    if (propertyType) params.set("types", propertyType);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[hsl(var(--brand-blue))] via-[hsl(213,54%,20%)] to-[hsl(217,54%,15%)]">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Floating shapes */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-[hsl(var(--brand-gold))]/10 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-20 bottom-40 h-80 w-80 rounded-full bg-[hsl(var(--accent))]/10 blur-3xl"
        />
        {/* Geometric shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute right-[10%] top-[20%] h-32 w-32 border border-white/10"
          style={{ transform: "rotate(45deg)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute left-[15%] bottom-[30%] h-24 w-24 rounded-full border border-white/10"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              <Building className="h-4 w-4" />
              Trusted Real Estate Partner Since 2004
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="font-plus-jakarta text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
          >
            Find Your Perfect Home
            <br />
            <span className="text-[hsl(var(--brand-gold))]">in Kandivali</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg text-white/80 md:text-xl"
          >
            20+ years of trusted real estate service in MHADA Complex.
            <br className="hidden sm:block" />
            Your dream home is just a search away.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={fadeInUp}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-md">
              <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-2xl sm:flex-row sm:items-center" suppressHydrationWarning>
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
            className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70"
          >
            <span>Popular:</span>
            <button
              onClick={() => {
                setListingType("rent");
                setPropertyType("2bhk");
              }}
              className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:border-white/40 hover:text-white"
            >
              2 BHK for Rent
            </button>
            <button
              onClick={() => {
                setListingType("sale");
                setPropertyType("1bhk");
              }}
              className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:border-white/40 hover:text-white"
            >
              1 BHK for Sale
            </button>
            <button
              onClick={() => {
                setListingType("rent");
                setPropertyType("1rk");
              }}
              className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:border-white/40 hover:text-white"
            >
              1 RK for Rent
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <StatsGrid
              stats={stats}
              className="[&_>_div]:text-white [&_p]:text-white/70"
            />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/50"
          >
            <span className="text-xs">Scroll to explore</span>
            <div className="h-10 w-6 rounded-full border-2 border-white/30 p-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-white/50"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
