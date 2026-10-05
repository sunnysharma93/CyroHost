import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Infrastructure built for what you build next",
  description:
    "Compute, networking, and storage from CyroHost. India and Singapore are the published compute regions. Prices are confirmed before an order.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
