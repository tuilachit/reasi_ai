import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = {
  title: { absolute: "Reasi Support | Reasi" },
  description: "Help with your account, meal plans, shopping lists, store routes, and photo tools.",
};

export default function SupportPage() {
  return <LegalPage document="support" />;
}
