import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Reasi" },
  description: "How Reasi collects, uses, stores, and deletes information when you plan meals and shop.",
};

export default function PrivacyPage() {
  return <LegalPage document="privacy" />;
}
