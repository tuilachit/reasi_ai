import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Reasi" },
  description: "The practical rules for using Reasi, its AI shopping tools, and Reasi Pro.",
};

export default function TermsPage() {
  return <LegalPage document="terms" />;
}
