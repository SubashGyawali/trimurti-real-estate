"use client";

import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

export function useScrollState(threshold = 50) {
  const { scrollY } = useScroll();
  const [isCompact, setIsCompact] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsCompact(latest > threshold);
  });

  return { isCompact, scrollY };
}
