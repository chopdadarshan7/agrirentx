import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inr } from "@/lib/data";
import {
  useRentalerBookings,
  useApproveBooking,
  useRejectBooking,
  useCompleteBooking,
} from "@/hooks/queries/use-bookings";
import type { BookingStatus } from "@/types/models";

export const Route = createFileRoute("/rentaler/bookings/")({
  head: () => ({
    meta: [
      { title: "Bookings Received — AgriRentX" },
      { name: "description", content: "Approve or reject rental requests for your equipment." },
      { property: "og:title", content: "Bookings Received — AgriRentX" },
      { property: "og:description", content: "Manage incoming rental requests." },
    ],
  }),
  component: RentalerBookingsPage,
});

const filters = ["all", "pending_payment", "confirmed", "active", "completed", "cancelled", "rejected"] as const;

function RentalerBookingsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const { data: bookings = [] } = useRentalerBookings();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const completeBooking = useCompleteBooking();
  const list = filter === "all" ? bookings : bookings.filter((b) => b.booking_status === (filter as BookingStatus));

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings received" description="Respond to requests promptly to keep your ranking." />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="flex-wrap">
          {filters.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">
              {f.replace("_", " ")}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          icon={<CalendarRange className="size-5" />}
          title="No bookings here"
          message="Requests matching this filter will appear here as farmers book your equipment."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((b) => {
            const equipment = typeof b.equipment_id === "string" ? null : b.equipment_id;
            const farmer = typeof b.farmer_id === "string" ? null : b.farmer_id;
            return (
              <li key={b._id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{equipment?.title ?? "Equipment"}</p>
                  <p className="text-sm text-muted-foreground">
                    {farmer?.fullName ?? "Farmer"} · {new Date(b.start_date).toLocaleDateString()} –{" "}
                    {new Date(b.end_date).toLocaleDateString()} · {inr(b.total_amount)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={b.booking_status} />
                  <StatusBadge status={b.payment_status} />
                  {b.booking_status === "confirmed" ? (
                    <>
                      <Button size="sm" onClick={() => approveBooking.mutate(b._id)} disabled={approveBooking.isPending}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectBooking.mutate({ id: b._id })}
                        disabled={rejectBooking.isPending}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {b.booking_status === "active" ? (
                    <Button size="sm" onClick={() => completeBooking.mutate(b._id)} disabled={completeBooking.isPending}>
                      Mark completed
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/rentaler/bookings/$bookingId" params={{ bookingId: b._id }}>
                      Details
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
