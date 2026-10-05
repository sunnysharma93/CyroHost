import { AdminGate } from "@/components/admin/AdminGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Admin · CyroHost" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
