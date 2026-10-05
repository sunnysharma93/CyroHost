import { DashboardGate } from "@/components/dashboard/DashboardGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Console · CyroHost" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardGate>{children}</DashboardGate>;
}
