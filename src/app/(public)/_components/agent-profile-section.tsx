"use client";

// Agent Profile Section - Founder spotlight + team member cards
// Displays the team behind Trimurti Real Estate

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MessageCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teamMembers } from "@/lib/data/landing-data";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/landing";

export function AgentProfileSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const founder = teamMembers.find((m) => m.isFounder);
  const otherMembers = teamMembers.filter((m) => !m.isFounder);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-white via-muted/20 to-white py-16 md:py-24"
    >
      {/* Subtle dot-grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-[hsl(var(--brand-gold))]">
            The Team Behind Your Dream Home
          </span>
          <h2 className="font-plus-jakarta text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Meet Our <span className="text-primary">Expert Team</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Led by 20+ years of local expertise, our dedicated team is committed
            to finding you the perfect property in Kandivali West.
          </p>
          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[hsl(var(--brand-gold))]" />
        </motion.div>

        {/* Founder Spotlight */}
        {founder && <FounderSpotlight member={founder} isInView={isInView} />}

        {/* Team Members */}
        {otherMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="mb-8 text-center font-plus-jakarta text-xl font-semibold text-foreground md:text-2xl">
              Our Dedicated Team
            </h3>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              {otherMembers.map((member, index) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  isInView={isInView}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// --- Founder Spotlight ---

function FounderSpotlight({
  member,
  isInView,
}: {
  member: TeamMember;
  isInView: boolean;
}) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello ${member.name}! I'm interested in learning more about properties in Kandivali West.`
    );
    window.open(`https://wa.me/${member.whatsapp}?text=${message}`, "_blank");
  };

  return (
    <div className="mb-16">
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100">
        <div className="grid gap-0 lg:grid-cols-5">
          {/* Photo Column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative lg:col-span-2"
          >
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px]">
              <Image
                src={member.image}
                alt={`${member.name} - ${member.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/5" />
            </div>
            {/* Gold accent stripe */}
            <div className="absolute bottom-0 right-0 top-0 hidden w-1 bg-[hsl(var(--brand-gold))] lg:block" />
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col justify-center p-8 md:p-10 lg:col-span-3 lg:p-12"
          >
            {/* Badge */}
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--brand-gold))]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand-gold))]">
              <Award className="h-3.5 w-3.5" />
              Founder & Lead
            </div>

            {/* Name */}
            <h3 className="font-plus-jakarta text-2xl font-bold text-foreground md:text-3xl">
              {member.name}
            </h3>

            {/* Title */}
            <p className="mt-1 text-lg font-medium text-primary">
              {member.title}
            </p>

            {/* Extended Bio */}
            <p className="mt-5 leading-relaxed text-muted-foreground">
              {member.founderBio || member.bio}
            </p>

            {/* Specializations */}
            {member.specializations && (
              <div className="mt-5 flex flex-wrap gap-2">
                {member.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Row */}
            {member.stats && (
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
                {member.stats.map((stat, index) => (
                  <FounderStat
                    key={stat.label}
                    stat={stat}
                    index={index}
                    isInView={isInView}
                  />
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <Link href={`tel:${member.phone.replace(/\s/g, "")}`}>
                  <Phone className="h-4 w-4" />
                  {member.phone}
                </Link>
              </Button>
              {member.email && (
                <Button
                  variant="ghost"
                  className="gap-2 text-muted-foreground"
                  asChild
                >
                  <Link href={`mailto:${member.email}`}>
                    <Mail className="h-4 w-4" />
                    Email
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- Animated Stat Counter ---

function FounderStat({
  stat,
  index,
  isInView,
}: {
  stat: { value: number; suffix: string; label: string };
  index: number;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const duration = 2000 + index * 200;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * stat.value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, stat.value, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
      className="text-center"
    >
      <div className="font-plus-jakarta text-2xl font-bold text-primary md:text-3xl">
        {count}
        {stat.suffix}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
    </motion.div>
  );
}

// --- Team Member Card ---

function TeamMemberCard({
  member,
  index,
  isInView,
}: {
  member: TeamMember;
  index: number;
  isInView: boolean;
}) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello ${member.name}! I'm interested in learning more about properties in Kandivali West.`
    );
    window.open(`https://wa.me/${member.whatsapp}?text=${message}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl bg-white sm:flex-row",
        "border border-gray-100 shadow-sm",
        "transition-all duration-300",
        "hover:border-primary/20 hover:shadow-md"
      )}
    >
      {/* Photo */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-36">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 144px"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center p-5">
        <h4 className="font-plus-jakarta text-base font-semibold text-foreground">
          {member.name}
        </h4>
        <p className="text-sm font-medium text-primary">{member.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {member.experience}
        </p>

        {/* Specializations */}
        {member.specializations && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.specializations.slice(0, 2).map((spec) => (
              <span
                key={spec}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            className="h-8 gap-1 bg-[#25D366] px-3 text-xs text-white hover:bg-[#20BD5A]"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 px-3 text-xs"
            asChild
          >
            <Link href={`tel:${member.phone.replace(/\s/g, "")}`}>
              <Phone className="h-3.5 w-3.5" />
              Call
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
