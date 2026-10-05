import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Login",
  description: "Sign in to a CyroHost account. Social login stays unavailable until provider credentials are configured.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <AuthSplit alternateHref="/register" alternateLabel="Create account">
      <Suspense fallback={<p className="text-sm text-[#5e5968]">Loading sign-in…</p>}>
        <LoginForm />
      </Suspense>
    </AuthSplit>
  );
}
