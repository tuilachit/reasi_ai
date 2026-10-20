"use client";

import { m, useAnimationControls, useInView } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "./use-motion-preference";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  delay?: number;
  distance?: number;
  kind?: "content" | "image";
};

/**
 * Content is visible in server HTML, without JavaScript and while waiting for
 * its observer. Motion is a one-time enhancement, never a condition for reading.
 */
export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  distance = 24,
  kind = "content",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const played = useRef(false);
  const inView = useInView(ref, { once: true, amount: 0.14 });
  const controls = useAnimationControls();
  const reduced = useMotionPreference();
  const Element = as === "li" ? m.li : as === "article" ? m.article : m.div;

  useEffect(() => {
    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      controls.stop();
      controls.set({ opacity: 1, y: 0, scale: 1 });
      return;
    }
    if (!inView || played.current) return;
    played.current = true;
    void controls.start({
      opacity: [kind === "image" ? 0.8 : 0.45, 1],
      y: [kind === "image" ? distance * 0.6 : distance, 0],
      scale: kind === "image" ? [1.025, 1] : 1,
      transition: { duration: kind === "image" ? 0.85 : 0.65, delay, ease: [0.22, 1, 0.36, 1] },
    });
  }, [controls, delay, distance, inView, kind, reduced]);

  return <Element
    ref={(element: HTMLElement | null) => { ref.current = element; }}
    className={className}
    initial={false}
    animate={controls}
  >{children}</Element>;
}
