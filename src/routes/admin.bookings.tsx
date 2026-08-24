import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr } from "@/lib/data";
import { useAdminBookings } from "@/hooks/queries/use-admin";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "All Bookings — AgriRentX Admin" },
      { name: "description", content: "Every rental across the platform with status and payment state." },
      { property: "og:title", content: "All Bookings — AgriRentX Admin" },
      { property: "og:description", content: "Monitor rentals end to end." },
    ],
  }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const { data } = useAdminBookings({ page, limit: 20 });
  const bookings = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Read-only view of every rental on the platform." />
      <div className="surface-card overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => {
              const equipment = typeof b.equipment_id === "string" ? null : b.equipment_id;
              const farmer = typeof b.farmer_id === "string" ? null : b.farmer_id;
              const rentaler = typeof b.rentaler_id === "string" ? null : b.rentaler_id;
              return (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b._id.slice(-8)}</TableCell>
                  <TableCell>{equipment?.title ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {farmer?.fullName ?? "—"} → {rentaler?.fullName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{inr(b.total_amount)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <StatusBadge status={b.booking_status} />
                      <StatusBadge status={b.payment_status} />
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
    </div>
  );
}
