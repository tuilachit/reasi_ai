import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans-main", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-main", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.reasiai.com"),
  title: "Reasi | Clinics write the plan. Reasi finds it on the shelf.",
  description: "Every new patient gets a priced basket at their own Coles, Woolworths or ALDI, built from your guidance and checked by your team.",
  robots: { index: process.env.VERCEL_ENV !== "preview", follow: true },
  openGraph: {
    title: "Clinics write the plan. Reasi finds it on the shelf.",
    description: "Nutrition guidance, translated into a real first shop. Built for clinics and dietitians.",
    siteName: "Reasi",
    type: "website",
    locale: "en_AU",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-AU" data-theme="light"><body className={`${sans.variable} ${mono.variable}`}><MotionProvider>{children}</MotionProvider></body></html>;
}
