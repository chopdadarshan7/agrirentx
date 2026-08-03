import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookings, inr } from "@/lib/data";

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

const filters = ["all", "pending", "approved", "ongoing", "completed", "cancelled"] as const;

function RentalerBookingsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const mine = bookings.filter((b) => b.rentaler === "Rajesh Patil");
  const list = filter === "all" ? mine : mine.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings received" description="Respond to requests within 24 hours to keep your ranking." />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="flex-wrap">
          {filters.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">
              {f}
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
          {list.map((b) => (
            <li key={b.id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium">{b.equipmentTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {b.farmer} · {b.from} – {b.to} · {inr(b.amount)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={b.status} />
                <StatusBadge status={b.paymentStatus} />
                {b.status === "pending" ? (
                  <>
                    <Button size="sm">Approve</Button>
                    <Button size="sm" variant="outline">
                      Reject
                    </Button>
                  </>
                ) : null}
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/rentaler/bookings/$bookingId" params={{ bookingId: b.id }}>
                    Details
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
