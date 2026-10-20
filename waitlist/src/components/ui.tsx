import type { ReactNode, SVGProps } from "react";
import Image from "next/image";

export const contactHref = "mailto:luke@reasiai.com";

export function Arrow(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}><path d="M4 12h15M13 5l7 7-7 7" /></svg>;
}

export function Check(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}><path d="m4 10 4 4 8-9" /></svg>;
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand ${footer ? "brand-footer" : ""}`} href="#top" aria-label="Reasi home"><Image className="brand-image" src="/reasi-logo.jpeg" alt="Reasi" width={200} height={200} preload={!footer} unoptimized /></a>;
}

export function CTA({ className = "" }: { className?: string }) {
  return <a className={`cta ${className}`} href={contactHref}><span>Book a 15-minute call</span><Arrow /></a>;
}

export function Eyebrow({ children, number }: { children: ReactNode; number?: string }) {
  return <p className="eyebrow">{number && <span className="section-number">{number}</span>}{children}</p>;
}

export function Barcode({ className = "" }: { className?: string }) {
  const bars = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 3, 1, 1, 2, 1, 4, 1, 2];
  let x = 0;
  return <svg className={`barcode ${className}`} viewBox="0 0 112 26" aria-hidden="true">{bars.map((width, i) => { const left = x; x += width + 2; return <rect key={i} x={left} y="0" width={width} height={i % 6 === 0 ? 26 : 22} fill="currentColor" />; })}</svg>;
}
