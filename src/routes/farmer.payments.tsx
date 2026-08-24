import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import { usePaymentHistory, useRetryPayment } from "@/hooks/queries/use-payments";

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
  const { data: payments = [] } = usePaymentHistory();
  const retryPayment = useRetryPayment();

  return (
    <div className="space-y-6">
      <PageHeader title="Payment history" description="Receipts for every booking you've paid for." />

      {payments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-5" />}
          title="No payments yet"
          message="Once you complete your first booking, its receipt will appear here."
        />
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const booking = typeof p.booking_id === "string" ? null : p.booking_id;
                const equipment =
                  booking && typeof booking.equipment_id !== "string" ? booking.equipment_id : null;
                return (
                  <TableRow
                    key={p._id}
                    className={cn(
                      p.payment_status === "refunded" && "bg-info/5",
                      p.payment_status === "failed" && "bg-destructive/5",
                    )}
                  >
                    <TableCell className="text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{equipment?.title ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{p.payment_method ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.payment_status} />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        p.payment_status === "refunded" && "text-info-foreground",
                        p.payment_status === "failed" && "text-destructive line-through",
                      )}
                    >
                      {inr(p.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.payment_status === "failed" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryPayment.mutate(p._id)}
                          disabled={retryPayment.isPending}
                        >
                          Retry
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
