"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  MapPin,
  Shield,
  Award,
  Headphones,
  Building,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const whyChooseUs = [
  {
    icon: MapPin,
    title: "Local Expertise",
    description:
      "We know every building, every floor, every corner of the MHADA complex. Our deep local knowledge helps you find exactly what you're looking for.",
  },
  {
    icon: Shield,
    title: "Transparent Dealings",
    description:
      "No hidden charges, no surprises. We believe in honest advice and clear communication throughout your property journey.",
  },
  {
    icon: Award,
    title: "20+ Years Experience",
    description:
      "Since 2004, we've helped hundreds of families find their perfect home. Our track record speaks for our commitment.",
  },
  {
    icon: Headphones,
    title: "After-Sale Support",
    description:
      "Our relationship doesn't end at the deal. We're here to help with documentation, registration, and any future needs.",
  },
];

const serviceAreas = [
  {
    name: "MHADA Complex",
    description: "53 seven-storied buildings and 24-storey towers",
    primary: true,
  },
  {
    name: "Bhoomi Park",
    description: "Premium residential complex",
    primary: false,
  },
  {
    name: "Marina Enclave",
    description: "Modern housing society",
    primary: false,
  },
  {
    name: "Dotam",
    description: "Private residential building",
    primary: false,
  },
];

export function AboutContent() {
  const storyRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const storyInView = useInView(storyRef, { once: true, margin: "-100px" });
  const whyChooseInView = useInView(whyChooseRef, { once: true, margin: "-100px" });
  const serviceInView = useInView(serviceRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand-blue))] to-primary py-20 md:py-28">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5" />
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-plus-jakarta text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              About Trimurti Real Estate
            </h1>
            <p className="mt-6 text-lg text-white/80 md:text-xl">
              Your Trusted Real Estate Partner Since 2004
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section ref={storyRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Photo placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative mx-auto aspect-[4/3] max-w-md overflow-hidden rounded-2xl">
                <Image
                  src={siteConfig.founder.image}
                  alt={`${siteConfig.founder.name} - ${siteConfig.founder.title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 448px"
                  priority
                />
              </div>

              {/* Decorative badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={storyInView ? { scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute -bottom-4 -right-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-[hsl(var(--brand-gold))] text-white shadow-lg lg:-right-8"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">20+</div>
                  <div className="text-xs">Years</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-sm font-medium text-primary">Our Story</span>
              <h2 className="mt-2 font-plus-jakarta text-3xl font-bold md:text-4xl">
                Building Trust,
                <br />
                <span className="text-primary">One Home at a Time</span>
              </h2>

              <div className="mt-6 space-y-4 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  In 2004, Mr. Niraj Koirala founded Trimurti Real Estate with a simple
                  mission: to help families in Kandivali West find their perfect home
                  with complete transparency and trust.
                </p>
                <p className="leading-relaxed">
                  What started as a small operation has grown into the most trusted
                  real estate agency in the MHADA complex area. Over two decades, we've
                  helped hundreds of families navigate the often complex world of
                  property buying and renting.
                </p>
                <p className="leading-relaxed">
                  Our deep knowledge of the 53 seven-storied MHADA buildings, the
                  24-storey towers, and nearby private complexes like Bhoomi Park and
                  Marina Enclave means we can match you with properties that truly fit
                  your needs and budget.
                </p>
                <p className="leading-relaxed">
                  We're not just agents – we're your neighbors, and we treat every
                  client like family.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section ref={whyChooseRef} className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={whyChooseInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="text-sm font-medium text-primary">Why Choose Us</span>
            <h2 className="mt-2 font-plus-jakarta text-3xl font-bold md:text-4xl">
              What Sets Us Apart
            </h2>
            <p className="mt-4 text-muted-foreground">
              We're committed to making your property journey smooth, transparent, and
              successful.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate={whyChooseInView ? "animate" : "initial"}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 font-plus-jakarta text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Service Area Section */}
      <section ref={serviceRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={serviceInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-medium text-primary">Service Area</span>
              <h2 className="mt-2 font-plus-jakarta text-3xl font-bold md:text-4xl">
                Kandivali West
                <br />
                <span className="text-primary">Specialists</span>
              </h2>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                We focus exclusively on Kandivali West, which allows us to provide
                unmatched expertise in property values, building histories, and
                neighborhood dynamics.
              </p>

              <div className="mt-8 space-y-4">
                {serviceAreas.map((area, index) => (
                  <motion.div
                    key={area.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={serviceInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className={`flex items-start gap-4 rounded-xl p-4 ${
                      area.primary ? "bg-primary/5" : "bg-muted/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        area.primary
                          ? "bg-primary text-primary-foreground"
                          : "bg-background"
                      }`}
                    >
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{area.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {area.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={serviceInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50">
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-10 w-10 text-primary/40" />
                  </div>
                  <p className="mt-4 font-medium text-muted-foreground">
                    Kandivali West, Mumbai
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground/70">
                    MHADA Colony & Surrounding Areas
                  </p>
                </div>
              </div>

              {/* Stats overlay */}
              <motion.div
                initial={{ scale: 0 }}
                animate={serviceInView ? { scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="absolute -bottom-6 left-4 right-4 rounded-xl bg-background p-4 shadow-lg sm:left-8 sm:right-8"
              >
                <div className="grid grid-cols-3 divide-x">
                  <div className="px-2 text-center">
                    <div className="font-plus-jakarta text-2xl font-bold text-primary">
                      53+
                    </div>
                    <div className="text-xs text-muted-foreground">Buildings</div>
                  </div>
                  <div className="px-2 text-center">
                    <div className="font-plus-jakarta text-2xl font-bold text-primary">
                      24
                    </div>
                    <div className="text-xs text-muted-foreground">Storey Towers</div>
                  </div>
                  <div className="px-2 text-center">
                    <div className="font-plus-jakarta text-2xl font-bold text-primary">
                      500+
                    </div>
                    <div className="text-xs text-muted-foreground">Happy Families</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="bg-gradient-to-br from-[hsl(var(--brand-blue))] to-primary py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="font-plus-jakarta text-3xl font-bold text-white md:text-4xl">
              Ready to Find Your Home?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Let us help you discover the perfect property in Kandivali West. Contact
              us today for a free consultation.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="group">
                <Link href="/properties">
                  Browse Properties
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
