import type { Metadata } from "next";
import { ClientFrame } from "@/components/client/ClientFrame";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Account",
  description: "Account screen inside the CyroHost client area. Profile changes are not saved.",
  path: "/client/account",
});

export default function AccountPage() {
  return (
    <ClientFrame title="Account" lede="These fields show the shape of a profile. They are disabled because no account is loaded.">
      <form className="max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-ink">
            Name
          </label>
          <input id="name" disabled placeholder="Not signed in" className="mt-2 w-full border border-line bg-panel px-3 py-3 text-sm text-muted" />
        </div>
        <div>
          <label htmlFor="account-email" className="block text-sm text-ink">
            Email
          </label>
          <input id="account-email" disabled placeholder="Not signed in" className="mt-2 w-full border border-line bg-panel px-3 py-3 text-sm text-muted" />
        </div>
        <button type="button" disabled className="inline-flex min-h-11 items-center border border-line px-4 text-sm text-muted">
          Save changes
        </button>
        <p className="text-sm leading-6 text-muted">Saving is disabled. No profile is stored in the browser or on a server.</p>
      </form>
    </ClientFrame>
  );
}
