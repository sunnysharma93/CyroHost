import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Create Account",
  description: "Create a CyroHost account. Passwords are hashed on the server and are not stored in the browser.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <AuthSplit alternateHref="/login" alternateLabel="Login">
      <RegisterForm />
    </AuthSplit>
  );
}
