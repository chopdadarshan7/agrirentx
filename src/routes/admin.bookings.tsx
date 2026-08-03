import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { bookings, inr } from "@/lib/data";

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
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Read-only view of every rental on the platform." />
      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Booking</th>
              <th className="px-5 py-3 font-medium">Equipment</th>
              <th className="px-5 py-3 font-medium">Parties</th>
              <th className="px-5 py-3 font-medium">Window</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="px-5 py-3 font-medium">{b.id}</td>
                <td className="px-5 py-3">{b.equipmentTitle}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {b.farmer} → {b.rentaler}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {b.from} – {b.to}
                </td>
                <td className="px-5 py-3">{inr(b.amount)}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5">
                    <StatusBadge status={b.status} />
                    <StatusBadge status={b.paymentStatus} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
