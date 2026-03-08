"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { teamMembers } from "@/lib/data/landing-data";
import type { TeamMember } from "@/types/landing";

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const leadMember =
  teamMembers.find((member) =>
    member.title.toLowerCase().includes("proprietor")
  ) ?? teamMembers[0];

const supportingMembers = teamMembers.filter(
  (member) => member.id !== leadMember?.id
);

export function AgentProfileSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_34%,#fff8f2_100%)] py-16 md:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -left-20 top-8 size-72 rounded-full blur-3xl"
        style={{
          background: "hsl(var(--primary) / 0.12)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-12 size-80 rounded-full blur-3xl"
        style={{ background: "hsl(var(--accent) / 0.16)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/80 to-transparent"
      />

      <div className="container relative mx-auto flex flex-col gap-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.45 }}
          className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Our Team
          </span>
          <h2 className="font-plus-jakarta text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Meet the People Behind Your Dream Home
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A close-knit real estate team helping families buy, rent, and move
            with confidence in Kandivali West.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-6"
        >
          {leadMember ? <LeadAgentCard member={leadMember} /> : null}

          <div className="grid gap-6 lg:grid-cols-2">
            {supportingMembers.map((member) => (
              <SupportAgentCard key={member.id} member={member} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface AgentCardProps {
  member: TeamMember;
}

function LeadAgentCard({ member }: AgentCardProps) {
  return (
    <motion.article variants={fadeInUp}>
      <Card className="overflow-hidden border-border/70 bg-white/90 shadow-[0_30px_80px_-44px_hsl(var(--primary)/0.35)] backdrop-blur-sm">
        <div className="grid lg:grid-cols-[minmax(360px,0.48fr)_minmax(0,0.52fr)]">
          <div className="relative min-h-[340px] overflow-hidden bg-slate-100 md:min-h-[430px]">
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 44vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
              20+ years in Kandivali real estate
            </div>
          </div>

          <div className="flex h-full flex-col">
            <CardHeader className="p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <Badge variant="secondary" className="w-fit">
                  Proprietor Spotlight
                </Badge>
                <div className="flex flex-col gap-2">
                  <CardTitle className="font-plus-jakarta text-2xl tracking-tight md:text-3xl">
                    <h3>{member.name}</h3>
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-primary md:text-base">
                    {member.title}
                  </CardDescription>
                </div>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
                {member.email ? (
                  <Link
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    {member.email}
                  </Link>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 md:px-8">
              <div className="flex flex-wrap gap-2">
                <div className="rounded-full bg-primary/8 px-3 py-1.5 text-sm text-foreground">
                  Proprietor & site visits
                </div>
                <div className="rounded-full bg-primary/8 px-3 py-1.5 text-sm text-foreground">
                  Sales, rentals, and resale guidance
                </div>
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="flex flex-col items-stretch gap-3 p-6 md:px-8">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild size="lg">
                  <Link
                    href={getWhatsAppHref(member)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Chat with ${member.name} on WhatsApp`}
                  >
                    <MessageCircle data-icon="inline-start" />
                    WhatsApp
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link
                    href={getPhoneHref(member.phone)}
                    aria-label={`Call ${member.name}`}
                  >
                    <Phone data-icon="inline-start" />
                    Call
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}

function SupportAgentCard({ member }: AgentCardProps) {
  return (
    <motion.article variants={fadeInUp}>
      <Card className="overflow-hidden border-border/70 bg-white/92 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[16/8.5] overflow-hidden bg-muted">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
        </div>

        <div className="flex h-full flex-col">
          <CardHeader className="p-5 md:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <CardTitle className="font-plus-jakarta text-xl tracking-tight md:text-2xl">
                  <h3>{member.name}</h3>
                </CardTitle>
                <CardDescription className="text-sm font-medium text-primary">
                  {member.title}
                </CardDescription>
              </div>
              <p className="text-sm text-muted-foreground">{member.experience}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {member.bio}
              </p>
              {member.email ? (
                <Link
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  {member.email}
                </Link>
              ) : null}
            </div>
          </CardHeader>

          <Separator />

          <CardFooter className="grid gap-3 p-5 md:grid-cols-2 md:p-6">
            <Button asChild>
              <Link
                href={getWhatsAppHref(member)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Chat with ${member.name} on WhatsApp`}
              >
                <MessageCircle data-icon="inline-start" />
                WhatsApp
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href={getPhoneHref(member.phone)}
                aria-label={`Call ${member.name}`}
              >
                <Phone data-icon="inline-start" />
                Call
              </Link>
            </Button>
          </CardFooter>
        </div>
      </Card>
    </motion.article>
  );
}

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

function getWhatsAppHref(member: TeamMember) {
  const message = encodeURIComponent(
    `Hello ${member.name}! I'm interested in learning more about properties in Kandivali West.`
  );

  return `https://wa.me/${member.whatsapp}?text=${message}`;
}
