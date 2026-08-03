import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, MessageSquare, ShieldCheck, Tractor, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard, StatCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  bookings,
  equipmentMixSeries,
  equipments,
  inr,
  payments,
  reviews,
  revenueSeries,
  userGrowthSeries,
  users,
} from "@/lib/data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview — AgriRentX" },
      { name: "description", content: "Platform health, moderation queues and revenue at a glance." },
      { property: "og:title", content: "Admin Overview — AgriRentX" },
      { property: "og:description", content: "Monitor listings, users and payments across AgriRentX." },
    ],
  }),
  component: AdminOverview,
});

const chartTooltip = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
};

function AdminOverview() {
  const pendingRentalers = users.filter((u) => u.rentalerStatus === "pending");
  const pendingEquipment = equipments.filter((e) => e.approvalStatus === "pending");
  const flaggedReviews = reviews.filter((r) => r.rating <= 2 && !r.hidden);
  const gmv = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  const queues = [
    {
      label: "Rentaler applications",
      count: pendingRentalers.length,
      to: "/admin/rentalers" as const,
      icon: ShieldCheck,
    },
    { label: "Equipment awaiting approval", count: pendingEquipment.length, to: "/admin/equipment" as const, icon: Tractor },
    { label: "Reviews to moderate", count: flaggedReviews.length, to: "/admin/reviews" as const, icon: MessageSquare },
    {
      label: "Failed payments",
      count: payments.filter((p) => p.status === "failed").length,
      to: "/admin/payments" as const,
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Platform overview" description="Everything that needs a human decision, first." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gross bookings value" value={inr(gmv)} tone="primary" icon={<CreditCard className="size-4" />} />
        <StatCard label="Registered users" value={String(users.length * 179)} icon={<Users className="size-4" />} />
        <StatCard label="Live listings" value={String(equipments.length * 37)} icon={<Tractor className="size-4" />} />
        <StatCard label="Bookings this month" value={String(bookings.length * 12)} />
      </div>

      <SectionCard title="Moderation queues" description="Oldest requests first — respond within 48 hours">
        <div className="grid gap-3 sm:grid-cols-2">
          {queues.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3 transition-colors hover:bg-accent/50"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <q.icon className="size-4 text-muted-foreground" />
                {q.label}
              </span>
              <StatusBadge
                status={q.count > 0 ? "pending" : "approved"}
                label={q.count > 0 ? `${q.count} waiting` : "Clear"}
              />
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Revenue" description="Last six months">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={chartTooltip} formatter={(v: number) => inr(v)} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#adminRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="User growth">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthSeries} margin={{ left: -12, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="users" stroke="var(--color-chart-2)" strokeWidth={2} fill="var(--color-chart-2)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Listings by category">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={equipmentMixSeries} margin={{ left: -12, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={chartTooltip} />
              <Bar dataKey="listings" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard
        title="Latest bookings"
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/bookings">View all</Link>
          </Button>
        }
      >
        <ul className="divide-y divide-border">
          {bookings.slice(0, 5).map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{b.equipmentTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {b.farmer} → {b.rentaler} · {inr(b.amount)}
                </p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={b.status} />
                <StatusBadge status={b.paymentStatus} />
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
