import type { Metadata } from "next";
import Admin from "@/components/Admin";

export const metadata: Metadata = { title: "SUTO — Orders", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <Admin />;
}
