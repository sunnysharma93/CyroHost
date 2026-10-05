import { ServicePage } from "@/components/dashboard/ServicePage";
import { dashboardMissing } from "@/content/dashboard";

export default function DdosPage() {
  return (
    <ServicePage
      title="DDoS Protection"
      endpoint={dashboardMissing.ddos}
      lede="Shield is the public name for DDoS and network protection. No mitigation size or live attack status is published, and this page does not invent one."
    />
  );
}
