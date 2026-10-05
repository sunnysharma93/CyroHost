import type { Metadata } from "next";
import { ClientFrame } from "@/components/client/ClientFrame";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Invoices",
  description: "Invoice screen inside the CyroHost client area. No invoices or payments are processed here.",
  path: "/client/invoices",
});

export default function InvoicesPage() {
  return (
    <ClientFrame title="Invoices" lede="Payments are not collected on this website. The table stays empty on purpose.">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="py-3 pr-4 font-medium">Reference</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} className="py-8 text-muted">
              No invoices. Nothing on this page can be paid.
            </td>
          </tr>
        </tbody>
      </table>
    </ClientFrame>
  );
}
