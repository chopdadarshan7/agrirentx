import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tractor } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { equipments as seed, inr, type ApprovalStatus } from "@/lib/data";

export const Route = createFileRoute("/admin/equipment")({
  head: () => ({
    meta: [
      { title: "Equipment Moderation — AgriRentX Admin" },
      { name: "description", content: "Review new listings and approve or reject them before they go live." },
      { property: "og:title", content: "Equipment Moderation — AgriRentX Admin" },
      { property: "og:description", content: "Keep listings accurate and trustworthy." },
    ],
  }),
  component: AdminEquipmentPage,
});

const tabs = ["pending", "approved", "rejected"] as const;

function AdminEquipmentPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const [rows, setRows] = useState(seed);

  const setStatus = (id: string, approvalStatus: ApprovalStatus) =>
    setRows((list) => list.map((e) => (e.id === id ? { ...e, approvalStatus } : e)));

  const list = rows.filter((e) => e.approvalStatus === tab);

  return (
    <div className="space-y-6">
      <PageHeader title="Equipment" description="Check photos, specs and pricing before approving a listing." />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t} ({rows.filter((e) => e.approvalStatus === t).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          icon={<Tractor className="size-5" />}
          title={`No ${tab} listings`}
          message="New submissions from rentalers will appear in this queue."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((e) => (
            <li key={e.id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium">{e.title}</p>
                <p className="text-sm text-muted-foreground">
                  {e.owner} · {e.categoryName} · {e.district}, {e.state} · {inr(e.pricePerDay)}/day
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={e.approvalStatus} />
                {e.approvalStatus !== "approved" ? (
                  <Button size="sm" onClick={() => setStatus(e.id, "approved")}>
                    Approve
                  </Button>
                ) : null}
                {e.approvalStatus !== "rejected" ? (
                  <Button size="sm" variant="outline" onClick={() => setStatus(e.id, "rejected")}>
                    Reject
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
