import { ServicePage } from "@/components/dashboard/ServicePage";
import { dashboardMissing } from "@/content/dashboard";

export default function ObjectStoragePage() {
  return (
    <ServicePage
      title="Object Storage"
      endpoint={dashboardMissing.objectStorage}
      lede="Object storage is an enquiry. Buckets, usage, and transfer are not connected to this account."
    />
  );
}
