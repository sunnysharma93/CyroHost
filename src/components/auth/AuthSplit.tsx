import Link from "next/link";
import { AuthMapPanel } from "@/components/auth/AuthMapPanel";

export function AuthSplit({
  alternateHref,
  alternateLabel,
  children,
}: {
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#070b16] md:h-[100dvh] md:flex-row md:overflow-hidden">
      <AuthMapPanel />
      <section className="auth-pane flex w-full min-w-0 flex-col bg-[#f7f6f8] text-[#17151c] md:h-full md:w-1/2 md:shrink-0" aria-label="Account">
        <div className="flex shrink-0 justify-end px-5 pt-4 sm:px-8 sm:pt-6">
          <Link href={alternateHref} className="inline-flex min-h-11 items-center text-sm font-medium text-[#5c3d9e] hover:text-[#3f2a72]">
            {alternateLabel}
          </Link>
        </div>
        <div className="px-5 pb-8 sm:px-8 md:min-h-0 md:flex-1 md:overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[420px] py-4 md:min-h-full md:items-center">
            <div className="w-full">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
