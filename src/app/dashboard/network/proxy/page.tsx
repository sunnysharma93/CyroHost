import { ServicePage } from "@/components/dashboard/ServicePage";
import { dashboardMissing } from "@/content/dashboard";

export default function ProxyPage() {
  return (
    <ServicePage
      title="Proxy"
      endpoint={dashboardMissing.proxy}
      lede="A proxy is stored only when a proxy provider is connected. No listener, origin, or SSL status is listed."
    />
  );
}
