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
import { bookings, canCancel, inr, type BookingStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

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
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
  "rejected",
];

function MyBookingsPage() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const mine = bookings.filter((b) => b.farmer === "Aarti Deshmukh");
  const list = filter === "all" ? mine : mine.filter((b) => b.status === filter);

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
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="size-5" />}
          title={`No ${filter === "all" ? "" : filter} bookings`}
          message="Nothing here yet. Browse equipment in your district and book by the day."
          action={
            <Button asChild>
              <Link to="/equipment">Browse equipment</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((b) => (
            <article key={b.id} className="surface-card space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to="/farmer/bookings/$bookingId"
                    params={{ bookingId: b.id }}
                    className="font-medium hover:text-primary"
                  >
                    {b.equipmentTitle}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.id}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <dl className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">From</dt>
                  <dd>{b.from}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">To</dt>
                  <dd>{b.to}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Amount</dt>
                  <dd className="font-medium">{inr(b.amount)}</dd>
                </div>
              </dl>

              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <StatusBadge status={b.paymentStatus} label={`Payment ${b.paymentStatus}`} />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/farmer/bookings/$bookingId" params={{ bookingId: b.id }}>
                      Details
                    </Link>
                  </Button>
                  {canCancel(b) ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel booking {b.id}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {inr(b.amount)} will be refunded to your original payment method within
                            5–7 working days. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep booking</AlertDialogCancel>
                          <AlertDialogAction>Cancel and refund {inr(b.amount)}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
