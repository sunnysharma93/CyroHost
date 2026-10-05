"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const auth = path === "/login" || path === "/register";
  const consoleApp = path.startsWith("/dashboard") || path.startsWith("/admin");

  if (auth) {
    return (
      <main id="main" className="md:h-[100dvh] md:overflow-hidden">
        {children}
      </main>
    );
  }

  if (consoleApp) {
    return <main id="main" className="dash-app">{children}</main>;
  }

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="main" key={path} className="public-enter">
        {children}
      </main>
      <SiteFooter />
      <FloatingActions />
    </>
  );
}
