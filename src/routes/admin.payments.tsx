import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inr } from "@/lib/data";
import { useAdminPayments, useAdminRefundPayment } from "@/hooks/queries/use-admin";
import type { Payment } from "@/types/models";

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

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function PaymentDetailsDialog({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const booking = typeof payment.booking_id === "string" ? null : payment.booking_id;
  const equipment = booking && typeof booking.equipment_id !== "string" ? booking.equipment_id : null;
  const farmer = booking && typeof booking.farmer_id !== "string" ? booking.farmer_id : null;
  const rentaler = booking && typeof booking.rentaler_id !== "string" ? booking.rentaler_id : null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment {payment._id.slice(-8)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rental</h3>
            <dl className="mt-1">
              <DetailRow label="Equipment" value={equipment?.title ?? "—"} />
              <DetailRow label="Farmer" value={farmer?.fullName ?? "—"} />
              <DetailRow label="Rentaler" value={rentaler?.fullName ?? "—"} />
              {booking ? (
                <DetailRow
                  label="Rental window"
                  value={`${new Date(booking.start_date).toLocaleDateString()} – ${new Date(booking.end_date).toLocaleDateString()}`}
                />
              ) : null}
            </dl>
          </section>

          <Separator />

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</h3>
            <dl className="mt-1">
              <DetailRow label="Amount" value={inr(payment.amount)} />
              <DetailRow label="Method" value={payment.payment_method || "—"} />
              <DetailRow label="Status" value={<StatusBadge status={payment.payment_status} />} />
              <DetailRow label="Razorpay order" value={payment.razorpay_order_id} />
              <DetailRow label="Razorpay payment" value={payment.razorpay_payment_id || "—"} />
              <DetailRow label="Paid on" value={payment.paid_at ? new Date(payment.paid_at).toLocaleString() : "—"} />
            </dl>
          </section>

          <Separator />

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payout</h3>
            <dl className="mt-1">
              <DetailRow label="Platform commission" value={inr(payment.commission_amount ?? 0)} />
              <DetailRow label="Rentaler payout" value={inr(payment.payout_amount ?? 0)} />
              <DetailRow label="Payout status" value={<StatusBadge status={payment.payout_status ?? "pending"} />} />
            </dl>
          </section>

          {payment.refund_status !== "none" ? (
            <>
              <Separator />
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Refund</h3>
                <dl className="mt-1">
                  <DetailRow label="Refund status" value={<StatusBadge status={payment.refund_status} />} />
                  <DetailRow label="Refund reference" value={payment.refund_id || "—"} />
                  <DetailRow
                    label="Refunded on"
                    value={payment.refunded_at ? new Date(payment.refunded_at).toLocaleString() : "—"}
                  />
                </dl>
              </section>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Payment | null>(null);
  const { data } = useAdminPayments({ page, limit: 20 });
  const payments = data?.items ?? [];
  const pagination = data?.pagination;
  const refundPayment = useAdminRefundPayment();

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Reconcile platform payments and issue refunds." />

      <div className="surface-card overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Payment</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => {
              const booking = typeof p.booking_id === "string" ? null : p.booking_id;
              const equipment = booking && typeof booking.equipment_id !== "string" ? booking.equipment_id : null;
              const farmer = booking && typeof booking.farmer_id !== "string" ? booking.farmer_id : null;
              return (
                <TableRow key={p._id}>
                  <TableCell>
                    <p className="font-medium">{p._id.slice(-8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{farmer?.fullName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{equipment?.title ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.payment_method || "—"}</TableCell>
                  <TableCell>{inr(p.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.payment_status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="View details" onClick={() => setViewing(p)}>
                        <Eye className="size-4" />
                      </Button>
                      {p.payment_status === "paid" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Refund
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Refund {inr(p.amount)}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This issues a Razorpay refund for this payment and cannot be reversed from here.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => refundPayment.mutate({ id: p._id })}>
                                Issue refund
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {viewing ? <PaymentDetailsDialog payment={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  );
}
