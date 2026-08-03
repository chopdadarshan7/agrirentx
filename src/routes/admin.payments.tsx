import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { inr, payments as seed } from "@/lib/data";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — AgriRentX Admin" },
      { name: "description", content: "Track settlements, failed transactions and issue refunds." },
      { property: "og:title", content: "Payments — AgriRentX Admin" },
      { property: "og:description", content: "Reconcile platform payments and refunds." },
    ],
  }),
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const [rows, setRows] = useState(seed);
  const collected = rows.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const refunded = rows.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Settlements run every 48 hours after rental completion." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={inr(collected)} tone="primary" />
        <StatCard label="Refunded" value={inr(refunded)} />
        <StatCard
          label="Failed transactions"
          value={String(rows.filter((p) => p.status === "failed").length)}
          tone="danger"
        />
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 font-medium">Booking</th>
              <th className="px-5 py-3 font-medium">Payer</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3">
                  <p className="font-medium">{p.id}</p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.bookingId}</td>
                <td className="px-5 py-3">{p.payer}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.method}</td>
                <td className="px-5 py-3">{inr(p.amount)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  {p.status === "paid" ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Refund
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Refund {inr(p.amount)} to {p.payer}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Refunds reach the payer's account in 5–7 working days and cannot be reversed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              setRows((list) =>
                                list.map((r) => (r.id === p.id ? { ...r, status: "refunded" as const } : r)),
                              )
                            }
                          >
                            Issue refund
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
