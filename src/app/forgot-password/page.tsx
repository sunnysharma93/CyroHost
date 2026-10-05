import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Forgot password",
  description: "Request a CyroHost password reset. The response does not say whether the email is registered.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <div className="joy-grid">
      <div className="shell py-16 sm:py-24">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
