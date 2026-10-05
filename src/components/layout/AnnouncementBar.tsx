import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="border-b border-line bg-panel text-sm text-muted">
      <div className="shell flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Published compute regions: India and Singapore.</p>
        <Link href="/locations" className="text-cyan hover:text-ink">
          View locations
        </Link>
      </div>
    </div>
  );
}
