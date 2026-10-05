import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact";

const hits = new Map<string, { count: number; started: number }>();

function limited(ip: string) {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || now - current.started > 15 * 60 * 1000) {
    hits.set(ip, { count: 1, started: now });
    return false;
  }
  current.count += 1;
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (now - value.started > 15 * 60 * 1000) hits.delete(key);
    }
  }
  return current.count > 8;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ delivered: false, error: "rate_limited", message: "Too many messages. Try again later." }, { status: 429 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ delivered: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success || parsed.data.companyWebsite) {
    return NextResponse.json(
      {
        delivered: false,
        error: "validation",
        fields: parsed.success ? {} : parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      {
        delivered: false,
        error: "not_configured",
        message: "No delivery endpoint is configured. The enquiry was not sent.",
      },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        organisation: parsed.data.organisation,
        interest: parsed.data.interest,
        message: parsed.data.message,
        source: "cyrohost-website",
      }),
    });

    if (!upstream.ok) {
      return NextResponse.json({ delivered: false, error: "upstream" }, { status: 502 });
    }

    return NextResponse.json({ delivered: true });
  } catch {
    return NextResponse.json({ delivered: false, error: "upstream" }, { status: 502 });
  }
}
