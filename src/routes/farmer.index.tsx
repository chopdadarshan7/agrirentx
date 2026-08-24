import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Heart, Package, Search, Wallet } from "lucide-react";
import { EmptyState, PageHeader, SectionCard, StatCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBookings } from "@/hooks/queries/use-bookings";
import { useWishlist } from "@/hooks/queries/use-wishlist";

export const Route = createFileRoute("/farmer/")({
  head: () => ({
    meta: [
      { title: "Farmer Dashboard — AgriRentX" },
      { name: "description", content: "Track active bookings, saved equipment and spend at a glance." },
      { property: "og:title", content: "Farmer Dashboard — AgriRentX" },
      { property: "og:description", content: "Your bookings, wishlist and spend in one place." },
    ],
  }),
  component: FarmerDashboard,
});

function FarmerDashboard() {
  const { user } = useAuth();
  const { data: bookings = [] } = useMyBookings();
  const { data: wishlist = [] } = useWishlist();

  const active = bookings.filter((b) => b.booking_status === "active" || b.booking_status === "confirmed");
  const spend = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + b.total_amount, 0);
  const firstName = user?.fullName.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        description="Here's what's happening with your rentals this week."
        actions={
          <Button asChild>
            <Link to="/equipment">
              <Search className="size-4" />
              Find equipment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active bookings"
          value={String(active.length)}
          hint="Confirmed or currently running"
          icon={<CalendarCheck className="size-4" />}
          tone="primary"
        />
        <StatCard label="Total bookings" value={String(bookings.length)} icon={<Package className="size-4" />} />
        <StatCard label="Wishlist" value={String(wishlist.length)} hint="Saved for later" icon={<Heart className="size-4" />} />
        <StatCard label="Spent this season" value={inr(spend)} icon={<Wallet className="size-4" />} />
      </div>

      <SectionCard
        title="Recent bookings"
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/farmer/bookings">View all</Link>
          </Button>
        }
      >
        {bookings.length === 0 ? (
          <EmptyState
            icon={<Search className="size-5" />}
            title="No bookings yet"
            message="Browse equipment near you and book your first machine — it takes about six minutes."
            action={
              <Button asChild>
                <Link to="/equipment">Browse equipment</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {bookings.slice(0, 4).map((b) => {
              const equipment = typeof b.equipment_id === "string" ? null : b.equipment_id;
              return (
                <li key={b._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <Link
                      to="/farmer/bookings/$bookingId"
                      params={{ bookingId: b._id }}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {equipment?.title ?? "Equipment"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.start_date).toLocaleDateString()} → {new Date(b.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{inr(b.total_amount)}</span>
                    <StatusBadge status={b.booking_status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: "/equipment", label: "Browse equipment", icon: Search },
          { to: "/farmer/wishlist", label: "Open wishlist", icon: Heart },
          { to: "/farmer/payments", label: "Payment history", icon: Wallet },
        ].map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="surface-card flex items-center gap-3 p-4 text-sm font-medium transition-shadow hover:shadow-md"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <q.icon className="size-4" />
            </span>
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
