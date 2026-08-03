import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { inr, payments } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/payments")({
  head: () => ({
    meta: [
      { title: "Payment History — AgriRentX" },
      { name: "description", content: "Every rental payment, refund and failed charge on your account." },
      { property: "og:title", content: "Payment History — AgriRentX" },
      { property: "og:description", content: "Track payments, refunds and receipts." },
    ],
  }),
  component: PaymentHistoryPage,
});

function PaymentHistoryPage() {
  const mine = payments.filter((p) => p.payer === "Aarti Deshmukh");

  return (
    <div className="space-y-6">
      <PageHeader title="Payment history" description="Receipts for every booking you've paid for." />

      {mine.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-5" />}
          title="No payments yet"
          message="Once you complete your first booking, its receipt will appear here."
        />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Equipment</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mine.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    p.status === "refunded" && "bg-info/5",
                    p.status === "failed" && "bg-destructive/5",
                  )}
                >
                  <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3 font-medium">{p.equipmentTitle}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.method}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right font-medium",
                      p.status === "refunded" && "text-info-foreground",
                      p.status === "failed" && "text-destructive line-through",
                    )}
                  >
                    {inr(p.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
