"use client";

// Agent Profile Section - Team member cards with photos and contact info
// Displays the team behind Trimurti Real Estate

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teamMembers } from "@/lib/data/landing-data";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/landing";

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

export function AgentProfileSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-primary">
            Our Team
          </span>
          <h2 className="font-plus-jakarta text-3xl font-bold text-foreground md:text-4xl">
            Meet the People Behind Your Dream Home
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our experienced team is dedicated to helping you find the perfect
            property in Kandivali West.
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {teamMembers.map((member) => (
            <AgentCard key={member.id} member={member} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Agent Card Component
interface AgentCardProps {
  member: TeamMember;
}

function AgentCard({ member }: AgentCardProps) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello ${member.name}! I'm interested in learning more about properties in Kandivali West.`
    );
    window.open(`https://wa.me/${member.whatsapp}?text=${message}`, "_blank");
  };

  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white",
        "border border-gray-100 shadow-sm",
        "transition-all duration-300",
        "hover:border-primary/20 hover:shadow-lg"
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Quick contact buttons - appear on hover */}
        <div
          className={cn(
            "absolute bottom-4 left-4 right-4 flex justify-center gap-2",
            "opacity-0 transition-all duration-300",
            "translate-y-4 group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <Button
            size="sm"
            className="gap-1 bg-[#25D366] text-white hover:bg-[#20BD5A]"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1 bg-white/90 backdrop-blur-sm hover:bg-white"
            asChild
          >
            <Link href={`tel:${member.phone.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4" />
              Call
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name */}
        <h3 className="font-plus-jakarta text-lg font-semibold text-foreground">
          {member.name}
        </h3>

        {/* Title */}
        <p className="text-sm text-primary">{member.title}</p>

        {/* Experience */}
        <p className="mt-2 text-sm text-muted-foreground">{member.experience}</p>

        {/* Contact Info */}
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href={`tel:${member.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Phone className="h-4 w-4" />
            {member.phone}
          </Link>
          {member.email && (
            <Link
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              {member.email}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
