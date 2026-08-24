import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarRange, IndianRupee, PlusCircle, Tractor } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState, PageHeader, SectionCard, StatCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { useRentalerDashboard } from "@/hooks/queries/use-dashboard";
import { useMyEquipment } from "@/hooks/queries/use-equipment";

export const Route = createFileRoute("/rentaler/")({
  head: () => ({
    meta: [
      { title: "Rentaler Dashboard — AgriRentX" },
      { name: "description", content: "Revenue, listings and incoming booking requests in one view." },
      { property: "og:title", content: "Rentaler Dashboard — AgriRentX" },
      { property: "og:description", content: "Track earnings and manage your equipment listings." },
    ],
  }),
  component: RentalerDashboard,
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function RentalerDashboard() {
  const { user } = useAuth();
  const { data: dashboard } = useRentalerDashboard();
  const { data: equipmentData } = useMyEquipment(user?._id);
  const listings = equipmentData?.items ?? [];

  const revenueSeries = (dashboard?.monthlyRevenue ?? []).map((m) => ({
    month: MONTHS[m._id.month - 1] ?? String(m._id.month),
    revenue: m.revenue,
  }));

  if (!dashboard) return null;

  if (listings.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rentaler dashboard" />
        <EmptyState
          icon={<Tractor className="size-5" />}
          title="You haven't listed any equipment yet"
          message="Add your first machine to start receiving booking requests."
          action={
            <Button asChild>
              <Link to="/rentaler/equipment/new">Add equipment</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rentaler dashboard"
        description="Earnings, listings and requests that need your attention."
        actions={
          <Button asChild>
            <Link to="/rentaler/equipment/new">
              <PlusCircle className="size-4" />
              Add equipment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue this season"
          value={inr(dashboard.stats.totalRevenue)}
          icon={<IndianRupee className="size-4" />}
          tone="primary"
        />
        <StatCard label="Live listings" value={String(dashboard.stats.totalEquipments)} icon={<Tractor className="size-4" />} />
        <StatCard
          label="Awaiting your action"
          value={String(dashboard.stats.pendingBookings)}
          hint="Approve or reject requests"
          icon={<CalendarRange className="size-4" />}
          tone={dashboard.stats.pendingBookings > 0 ? "warning" : "default"}
        />
        <StatCard label="Active rentals" value={String(dashboard.stats.activeRentals)} icon={<CalendarRange className="size-4" />} />
      </div>

      {revenueSeries.length > 0 ? (
        <SectionCard title="Revenue trend" description="Last six months">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => inr(v)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent booking requests"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/rentaler/bookings">View all</Link>
            </Button>
          }
        >
          {dashboard.recentBookings.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">No booking requests yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {dashboard.recentBookings.slice(0, 4).map((b) => {
                const equipment = typeof b.equipment_id === "string" ? null : b.equipment_id;
                const farmer = typeof b.farmer_id === "string" ? null : b.farmer_id;
                return (
                  <li key={b._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{equipment?.title ?? "Equipment"}</p>
                      <p className="text-xs text-muted-foreground">
                        {farmer?.fullName ?? "Farmer"} · {new Date(b.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={b.booking_status} />
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Your equipment"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/rentaler/equipment">Manage</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {listings.slice(0, 5).map((e) => (
              <li key={e._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{inr(e.price_per_day)} / day</p>
                </div>
                <div className="flex gap-1.5">
                  <StatusBadge status={e.approval_status} />
                  <StatusBadge status={e.status} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
