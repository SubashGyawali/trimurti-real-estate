"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  end: number;
  suffix?: string;
  label: string;
  duration?: number;
  className?: string;
}

export function StatCounter({
  end,
  suffix = "",
  label,
  duration = 2000,
  className,
}: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="font-plus-jakarta text-4xl font-bold text-primary md:text-5xl"
      >
        {count}
        {suffix}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-2 text-sm text-muted-foreground md:text-base"
      >
        {label}
      </motion.p>
    </div>
  );
}

interface StatsGridProps {
  stats: Array<{
    end: number;
    suffix?: string;
    label: string;
  }>;
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-8 md:gap-12",
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatCounter
          key={stat.label}
          end={stat.end}
          suffix={stat.suffix}
          label={stat.label}
          duration={2000 + index * 200}
        />
      ))}
    </div>
  );
}
