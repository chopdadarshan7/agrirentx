import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, ShieldCheck, Tractor, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard, StatCard } from "@/components/Primitives";
import { StatusBadge, statusTone } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/data";
import { useAdminDashboard, useAdminAnalytics } from "@/hooks/queries/use-dashboard";
import { useAdminPendingRentalers, useAdminPayments } from "@/hooks/queries/use-admin";

const TONE_COLOR: Record<ReturnType<typeof statusTone>, string> = {
  green: "var(--color-success)",
  amber: "var(--color-warning)",
  red: "var(--color-destructive)",
  blue: "var(--color-info)",
  slate: "var(--color-muted-foreground)",
};

const chartTooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
};

function SnapshotBarChart({ data }: { data: { label: string; total: number; color: string }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

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

function AdminOverview() {
  const { data: dashboard } = useAdminDashboard();
  const { data: analytics } = useAdminAnalytics();
  const { data: pendingRentalers = [] } = useAdminPendingRentalers();
  const { data: failedPayments } = useAdminPayments({ payment_status: "failed", limit: 1 });

  if (!dashboard) return null;

  const bookingStatusData = (analytics?.bookings ?? []).map((b) => ({
    label: b._id.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()),
    total: b.total,
    color: TONE_COLOR[statusTone(b._id)],
  }));

  const equipmentMixData = analytics
    ? [
        { label: "Approved", total: analytics.equipments.approved, color: TONE_COLOR[statusTone("approved")] },
        { label: "Pending", total: analytics.equipments.pending, color: TONE_COLOR[statusTone("pending")] },
        { label: "Rejected", total: analytics.equipments.rejected, color: TONE_COLOR[statusTone("rejected")] },
      ]
    : [];

  const userMixData = analytics
    ? [
        { label: "Farmers", total: analytics.users.totalFarmers, color: "var(--color-primary)" },
        { label: "Rentalers", total: analytics.users.totalRentalers, color: "var(--color-info)" },
      ]
    : [];

  const queues = [
    { label: "Rentaler applications", count: pendingRentalers.length, to: "/admin/rentalers" as const, icon: ShieldCheck },
    { label: "Equipment awaiting approval", count: dashboard.equipments.pendingEquipments, to: "/admin/equipment" as const, icon: Tractor },
    { label: "Failed payments", count: failedPayments?.pagination.total ?? 0, to: "/admin/payments" as const, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Platform overview" description="Everything that needs a human decision, first." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gross bookings value" value={inr(dashboard.payments.totalRevenue)} tone="primary" icon={<CreditCard className="size-4" />} />
        <StatCard label="Registered users" value={String(dashboard.users.totalUsers)} icon={<Users className="size-4" />} />
        <StatCard label="Live listings" value={String(dashboard.equipments.approvedEquipments)} icon={<Tractor className="size-4" />} />
        <StatCard label="Bookings today" value={String(dashboard.bookings.todayBookings)} />
        {analytics ? (
          <StatCard label="Average transaction value" value={inr(Math.round(analytics.revenue.averageTransaction))} />
        ) : null}
      </div>

      {analytics ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard title="Bookings by status" description="All-time booking counts">
            <SnapshotBarChart data={bookingStatusData} />
          </SectionCard>
          <SectionCard title="Equipment approval mix">
            <SnapshotBarChart data={equipmentMixData} />
          </SectionCard>
          <SectionCard title="User composition">
            <SnapshotBarChart data={userMixData} />
          </SectionCard>
        </div>
      ) : null}

      <SectionCard title="Moderation queues" description="Requests waiting on a decision">
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

      <SectionCard
        title="Latest bookings"
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/bookings">View all</Link>
          </Button>
        }
      >
        {dashboard.recentBookings.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {dashboard.recentBookings.slice(0, 5).map((b) => {
              const equipment = typeof b.equipment_id === "string" ? null : b.equipment_id;
              const farmer = typeof b.farmer_id === "string" ? null : b.farmer_id;
              return (
                <li key={b._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{equipment?.title ?? "Equipment"}</p>
                    <p className="text-xs text-muted-foreground">
                      {farmer?.fullName ?? "Farmer"} · {inr(b.total_amount)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={b.booking_status} />
                    <StatusBadge status={b.payment_status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
