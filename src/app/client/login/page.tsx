import type { Metadata } from "next";
import { ClientFrame } from "@/components/client/ClientFrame";
import { SignInForm } from "@/components/client/SignInForm";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sign in",
  description: "CyroHost sign-in screen. Submitting the form does not create a session.",
  path: "/client/login",
});

export default function LoginPage() {
  return (
    <ClientFrame title="Sign in" lede="Use this form to see the sign-in layout. A successful-looking login is not available, because no account system is connected.">
      <SignInForm />
    </ClientFrame>
  );
}
