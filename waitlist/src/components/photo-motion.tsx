"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useMotionPreference } from "./use-motion-preference";

/**
 * The image stays in the server HTML. Scroll only adds a small movement inside
 * its cropped frame; MotionValues update without rendering React on every tick.
 */
export function PhotoMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.03, 1]);

  return (
    <div className="photo-motion" ref={ref}>
      <m.div
        className="photo-motion-image"
        initial={false}
        style={{ y: reduced ? 0 : y, scale: reduced ? 1 : scale }}
      >
        {children}
      </m.div>
    </div>
  );
}
