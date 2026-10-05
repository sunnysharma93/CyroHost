import { ServicePage } from "@/components/dashboard/ServicePage";
import { dashboardMissing } from "@/content/dashboard";

export default function CdnPage() {
  return (
    <ServicePage
      title="CDN & Load Balancing"
      endpoint={dashboardMissing.cdn}
      lede="No CDN or load-balancer inventory is connected. Traffic and cache figures are not shown."
    />
  );
}
