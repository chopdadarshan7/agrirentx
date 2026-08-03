import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarRange, IndianRupee, PlusCircle, Tractor } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState, PageHeader, SectionCard, StatCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { bookings, equipments, inr, revenueSeries } from "@/lib/data";

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

function RentalerDashboard() {
  const owner = "Rajesh Patil";
  const listings = equipments.filter((e) => e.owner === owner);
  const incoming = bookings.filter((b) => b.rentaler === owner);
  const pending = incoming.filter((b) => b.status === "pending");
  const revenue = incoming.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.amount, 0);

  if (listings.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rentaler dashboard" />
        <EmptyState
          icon={<Tractor className="size-5" />}
          title="You haven't listed any equipment yet"
          message="Add your first machine to start receiving booking requests. Listings go live within two working days of document verification."
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
          value={inr(revenue)}
          hint="Settled within 48 hrs of completion"
          icon={<IndianRupee className="size-4" />}
          tone="primary"
        />
        <StatCard label="Live listings" value={String(listings.length)} icon={<Tractor className="size-4" />} />
        <StatCard
          label="Awaiting your action"
          value={String(pending.length)}
          hint="Approve or reject requests"
          icon={<CalendarRange className="size-4" />}
          tone={pending.length > 0 ? "warning" : "default"}
        />
        <StatCard label="Total bookings" value={String(incoming.length)} icon={<CalendarRange className="size-4" />} />
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent booking requests"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/rentaler/bookings">View all</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {incoming.slice(0, 4).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{b.equipmentTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.farmer} · {b.from}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
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
            {listings.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{inr(e.pricePerDay)} / day</p>
                </div>
                <div className="flex gap-1.5">
                  <StatusBadge status={e.approvalStatus} />
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
