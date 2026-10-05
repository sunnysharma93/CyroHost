import { ServicePage } from "@/components/dashboard/ServicePage";
import { dashboardMissing } from "@/content/dashboard";

export default function IpPage() {
  return (
    <ServicePage
      title="IP Addresses"
      endpoint={dashboardMissing.ips}
      lede="Address assignments for this account would come from the network API. None are listed here."
    />
  );
}
