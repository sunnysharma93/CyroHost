import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Reset password",
  description: "Choose a new CyroHost password with a single-use reset link.",
  path: "/reset-password",
});

export default function ResetPasswordPage() {
  return (
    <div className="joy-grid">
      <div className="shell py-16 sm:py-24">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
