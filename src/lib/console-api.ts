import { authFetch } from "@/lib/auth-api";

export class ConsoleError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function consoleJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authFetch(path, init);
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
  if (response.status === 401 && typeof window !== "undefined") {
    const here = window.location.pathname;
    if (here.startsWith("/dashboard") || here.startsWith("/admin")) {
      window.location.assign("/login?reason=session");
    }
  }
  if (!response.ok) {
    throw new ConsoleError(body.error ?? "error", body.message ?? "The request failed.");
  }
  return body as T;
}
