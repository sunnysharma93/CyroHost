import { ServicePage } from "@/components/dashboard/ServicePage";
import { dashboardMissing } from "@/content/dashboard";

export default function VolumesPage() {
  return (
    <ServicePage
      title="Storage Volumes"
      endpoint={dashboardMissing.volumes}
      lede="Block volumes appear here only after a storage provider is connected. No disk size or attachment is listed."
    />
  );
}
