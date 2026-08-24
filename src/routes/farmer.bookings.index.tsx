import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PackageSearch } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
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
import { inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useMyBookings, useCancelBooking } from "@/hooks/queries/use-bookings";
import type { BookingStatus } from "@/types/models";

export const Route = createFileRoute("/farmer/bookings/")({
  head: () => ({
    meta: [
      { title: "My Bookings — AgriRentX" },
      { name: "description", content: "Filter and manage every equipment booking you have made." },
      { property: "og:title", content: "My Bookings — AgriRentX" },
      { property: "og:description", content: "Track booking status, dates and payments." },
    ],
  }),
  component: MyBookingsPage,
});

const filters: (BookingStatus | "all")[] = [
  "all",
  "pending_payment",
  "confirmed",
  "active",
  "completed",
  "cancelled",
  "rejected",
];

function MyBookingsPage() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const { data: bookings = [] } = useMyBookings();
  const cancelBooking = useCancelBooking();
  const list = filter === "all" ? bookings : bookings.filter((b) => b.booking_status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="My bookings" description="Every rental you've requested, past and upcoming." />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-sm border border-border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="size-5" />}
          title={`No ${filter === "all" ? "" : filter.replace("_", " ")} bookings`}
          message="Nothing here yet. Browse equipment in your district and book by the day."
          action={
            <Button asChild>
              <Link to="/equipment">Browse equipment</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((b) => {
            const equipment = typeof b.equipment_id === "string" ? null : b.equipment_id;
            return (
              <article key={b._id} className="surface-card space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to="/farmer/bookings/$bookingId"
                      params={{ bookingId: b._id }}
                      className="font-medium hover:text-primary"
                    >
                      {equipment?.title ?? "Equipment"}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{b._id}</p>
                  </div>
                  <StatusBadge status={b.booking_status} />
                </div>

                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">From</dt>
                    <dd>{new Date(b.start_date).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">To</dt>
                    <dd>{new Date(b.end_date).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Amount</dt>
                    <dd className="font-medium">{inr(b.total_amount)}</dd>
                  </div>
                </dl>

                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <StatusBadge status={b.payment_status} label={`Payment ${b.payment_status}`} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/farmer/bookings/$bookingId" params={{ bookingId: b._id }}>
                        Details
                      </Link>
                    </Button>
                    {b.can_cancel ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                            <AlertDialogDescription>
                              The rentaler will be notified. Any payment already made is refunded via
                              Razorpay. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep booking</AlertDialogCancel>
                            <AlertDialogAction onClick={() => cancelBooking.mutate({ id: b._id })}>
                              Cancel booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
