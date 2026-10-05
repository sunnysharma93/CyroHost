export const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string | null;
  status: string;
  platformRole?: string;
};

type ErrorBody = {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
  devResetToken?: string;
};

let csrfToken: string | null = null;

export async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${apiBase}/api/auth/csrf`, { credentials: "include" });
  if (!response.ok) throw new Error("The sign-in service is not reachable.");
  const body = (await response.json()) as { csrfToken?: string };
  if (!body.csrfToken) throw new Error("The sign-in service did not provide a security token.");
  csrfToken = body.csrfToken;
  return csrfToken;
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const send = async () => {
    const token = await ensureCsrf();
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    headers.set("X-CSRF-Token", token);
    return fetch(`${apiBase}${path}`, { ...init, headers, credentials: "include" });
  };
  let response = await send();
  if (response.status === 403) {
    csrfToken = null;
    response = await send();
  }
  return response;
}

export async function readError(response: Response): Promise<ErrorBody> {
  try {
    return (await response.json()) as ErrorBody;
  } catch {
    return { message: "The sign-in service is not reachable." };
  }
}

export function consolePath(user: { platformRole?: string | null }) {
  return user.platformRole === "ADMIN" ? "/admin" : "/dashboard";
}

export async function currentUser() {
  const response = await fetch(`${apiBase}/api/auth/me`, { credentials: "include" });
  if (!response.ok) return null;
  return (await response.json()) as AuthUser;
}

export async function logoutSession() {
  try {
    await authFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // The API may be offline. The local session still ends.
  }
  csrfToken = null;
}

export async function providerStatus() {
  const response = await fetch(`${apiBase}/api/auth/oauth/providers`, { credentials: "include" });
  if (!response.ok) return { google: false, facebook: false, apple: false };
  return (await response.json()) as { google: boolean; facebook: boolean; apple: boolean };
}

export function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const label = ["Too short", "Weak", "Fair", "Good", "Strong"][score] ?? "Too short";
  return { score, label: password ? label : "" };
}
