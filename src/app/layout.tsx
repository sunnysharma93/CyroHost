import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { links, site } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#161311" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "CyroHost · Cloud, network, edge, and web",
    template: "%s · CyroHost",
  },
  description: site.description,
  applicationName: site.name,
  icons: { icon: "/favicon.png" },
  alternates: { canonical: `${site.url}/` },
  openGraph: {
    title: "CyroHost · Cloud, network, edge, and web",
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyroHost · Cloud, network, edge, and web",
    description: site.description,
  },
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  email: site.email,
  sameAs: [links.instagram, links.youtube, links.discord, links.telegram, links.linkedin],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var stored=localStorage.getItem("cyro-theme");var preference=stored==="dark"||stored==="system"||stored==="light"?stored:"light";var dark=window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=preference==="system"?(dark?"dark":"light"):preference;document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.theme="light";document.documentElement.style.colorScheme="light";}})();`}
        </Script>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
