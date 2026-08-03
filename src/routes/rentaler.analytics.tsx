import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard, StatCard } from "@/components/Primitives";
import { bookings, equipments, inr, revenueSeries } from "@/lib/data";

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

const pieColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function RentalerAnalyticsPage() {
  const listings = equipments.filter((e) => e.owner === "Rajesh Patil");
  const mine = bookings.filter((b) => b.rentaler === "Rajesh Patil");
  const paid = mine.filter((b) => b.paymentStatus === "paid");
  const total = paid.reduce((s, b) => s + b.amount, 0);
  const avg = paid.length > 0 ? Math.round(total / paid.length) : 0;

  const perEquipment = listings.map((e) => ({
    name: e.title.split(" ").slice(0, 2).join(" "),
    revenue: paid.filter((b) => b.equipmentTitle === e.title).reduce((s, b) => s + b.amount, 0),
  }));

  const statusSplit = ["completed", "active", "confirmed", "cancelled"].map((s) => ({
    name: s,
    value: mine.filter((b) => b.status === s).length,
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="How your fleet performed this season." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earnings" value={inr(total)} tone="primary" />
        <StatCard label="Average booking value" value={inr(avg)} />
        <StatCard label="Completed rentals" value={String(mine.filter((b) => b.status === "completed").length)} />
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Revenue by equipment">
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
        </SectionCard>

        <SectionCard title="Booking status split">
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
        </SectionCard>
      </div>
    </div>
  );
}
