import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard, StatCard } from "@/components/Primitives";
import { inr } from "@/lib/data";
import { useRentalerDashboard } from "@/hooks/queries/use-dashboard";
import { useRentalerBookings } from "@/hooks/queries/use-bookings";

export const Route = createFileRoute("/rentaler/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — AgriRentX Rentaler" },
      { name: "description", content: "Utilisation, revenue split and top performing machines." },
      { property: "og:title", content: "Analytics — AgriRentX Rentaler" },
      { property: "og:description", content: "See which machines earn the most." },
    ],
  }),
  component: RentalerAnalyticsPage,
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pieColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function RentalerAnalyticsPage() {
  const { data: dashboard } = useRentalerDashboard();
  const { data: bookings = [] } = useRentalerBookings();

  const paid = bookings.filter((b) => b.payment_status === "paid");
  const total = paid.reduce((s, b) => s + b.total_amount, 0);
  const avg = paid.length > 0 ? Math.round(total / paid.length) : 0;
  const completedCount = bookings.filter((b) => b.booking_status === "completed").length;

  const revenueByEquipment = new Map<string, number>();
  for (const b of paid) {
    const equipment = typeof b.equipment_id === "string" ? null : b.equipment_id;
    const name = equipment?.title.split(" ").slice(0, 2).join(" ") ?? "Equipment";
    revenueByEquipment.set(name, (revenueByEquipment.get(name) ?? 0) + b.total_amount);
  }
  const perEquipment = Array.from(revenueByEquipment, ([name, revenue]) => ({ name, revenue }));

  const statusSplit = ["completed", "active", "confirmed", "cancelled", "rejected"]
    .map((s) => ({ name: s, value: bookings.filter((b) => b.booking_status === s).length }))
    .filter((d) => d.value > 0);

  const revenueSeries = (dashboard?.monthlyRevenue ?? []).map((m) => ({
    month: MONTHS[m._id.month - 1] ?? String(m._id.month),
    revenue: m.revenue,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="How your fleet performed this season." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earnings" value={inr(total)} tone="primary" />
        <StatCard label="Average booking value" value={inr(avg)} />
        <StatCard label="Completed rentals" value={String(completedCount)} />
      </div>

      {revenueSeries.length > 0 ? (
        <SectionCard title="Monthly revenue">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries} margin={{ left: -12, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => inr(v)}
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Revenue by equipment">
          {perEquipment.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No paid bookings yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perEquipment} layout="vertical" margin={{ left: 24, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={90} />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => inr(v)}
                  />
                  <Bar dataKey="revenue" fill="var(--color-chart-2)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Booking status split">
          {statusSplit.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {statusSplit.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        fontSize: 12,
                        textTransform: "capitalize",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 flex flex-wrap gap-3 text-xs capitalize text-muted-foreground">
                {statusSplit.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                    {s.name} ({s.value})
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
