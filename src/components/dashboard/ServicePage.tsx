"use client";

import { useEffect, useState } from "react";
import { ConsoleError, consoleJson } from "@/lib/console-api";
import { ErrorPanel, PageSkeleton } from "@/components/dashboard/DashFeedback";
import { EmptyState, PageIntro, PrimaryLink, WhatsAppSupport } from "@/components/dashboard/DashUi";

export function ServicePage({
  title,
  lede,
  endpoint,
}: {
  title: string;
  lede: string;
  endpoint: string;
}) {
  const path = endpoint.replace(/^GET\s+/, "");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState("");
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancel = false;
    setFailed(false);
    setMessage("");
    consoleJson<{ message?: string; provider?: string }>(path)
      .then((body) => {
        if (!cancel) {
          setMessage(body.message ?? "Nothing is connected for this account.");
          setProvider(body.provider ?? "");
        }
      })
      .catch((error: unknown) => {
        if (!cancel) {
          setFailed(true);
          setMessage(error instanceof ConsoleError ? error.message : "The console API is not reachable.");
        }
      });
    return () => {
      cancel = true;
    };
  }, [path, attempt]);

  return (
    <div>
      <PageIntro title={title} lede={lede} />
      {!message && !failed ? <PageSkeleton label={`Loading ${title}`} /> : null}
      {failed ? <ErrorPanel title={`Unable to load ${title}.`} message={message} onRetry={() => setAttempt((value) => value + 1)} /> : null}
      {message && !failed ? (
      <EmptyState
        title={provider === "connected" ? title : `${title} is not connected`}
        body={message}
        actions={
          <>
            <PrimaryLink href="/dashboard/servers">Configure a VPS</PrimaryLink>
            <WhatsAppSupport />
          </>
        }
      />
      ) : null}
    </div>
  );
}
