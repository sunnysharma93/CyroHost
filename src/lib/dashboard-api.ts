import { apiBase } from "@/lib/auth-api";

export type CatalogResult<T> = {
  status: "ready" | "empty" | "missing" | "unauthorized" | "error";
  endpoint: string;
  items: T[];
  message: string;
};

export async function loadCatalog<T>(path: string, label: string): Promise<CatalogResult<T>> {
  try {
    const response = await fetch(`${apiBase}${path}`, { credentials: "include" });
    if (response.status === 401) {
      return { status: "unauthorized", endpoint: path, items: [], message: "Sign in to continue." };
    }
    if (response.status === 404 || response.status === 501) {
      return {
        status: "missing",
        endpoint: path,
        items: [],
        message: `${label} are not connected. Missing endpoint ${path}.`,
      };
    }
    if (!response.ok) {
      return {
        status: "error",
        endpoint: path,
        items: [],
        message: `${label} could not be loaded from ${path}.`,
      };
    }
    const body = (await response.json()) as { items?: T[] } | T[];
    const items = Array.isArray(body) ? body : (body.items ?? []);
    return {
      status: items.length ? "ready" : "empty",
      endpoint: path,
      items,
      message: items.length ? "" : `No ${label.toLowerCase()} are attached to this account.`,
    };
  } catch {
    return {
      status: "missing",
      endpoint: path,
      items: [],
      message: `${label} are not connected. The auth API is reachable only for account sessions. Missing endpoint ${path}.`,
    };
  }
}
