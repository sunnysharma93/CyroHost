const labels: Record<string, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  PROVISIONING: "Provisioning",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export function requestStatusLabel(status: string) {
  return labels[status] ?? status;
}

export function regionAvailabilityLabel(availability: string) {
  if (availability === "AVAILABLE") return "Available";
  if (availability === "DISABLED") return "Disabled";
  return "Availability on request";
}
