"use client";

import { LazyMotion, domMax, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domMax} strict><MotionConfig reducedMotion="user">{children}</MotionConfig></LazyMotion>;
}
