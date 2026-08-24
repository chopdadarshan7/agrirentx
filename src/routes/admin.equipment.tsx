import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tractor } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inr } from "@/lib/data";
import {
  useAdminPendingEquipment,
  useAdminApprovedEquipment,
  useAdminAllEquipment,
  useApproveEquipmentAdmin,
  useRejectEquipmentAdmin,
} from "@/hooks/queries/use-admin";
import type { EquipmentCategoryRef, EquipmentRentalerRef } from "@/types/models";

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
  const { data: pending = [] } = useAdminPendingEquipment();
  const { data: approved = [] } = useAdminApprovedEquipment();
  const { data: all = [] } = useAdminAllEquipment();
  const rejected = all.filter((e) => e.approval_status === "rejected");
  const approveEquipment = useApproveEquipmentAdmin();
  const rejectEquipment = useRejectEquipmentAdmin();

  const counts = { pending: pending.length, approved: approved.length, rejected: rejected.length };
  const list = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  return (
    <div className="space-y-6">
      <PageHeader title="Equipment" description="Check photos, specs and pricing before approving a listing." />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t} ({counts[t]})
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
          {list.map((e) => {
            const owner = typeof e.rentaler_id === "string" ? null : (e.rentaler_id as EquipmentRentalerRef);
            const category = typeof e.category_id === "string" ? null : (e.category_id as EquipmentCategoryRef);
            return (
              <li key={e._id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {owner?.fullName ?? "Rentaler"} · {category?.name ?? "Equipment"} ·{" "}
                    {e.location.district ?? e.location.address} · {inr(e.price_per_day)}/day
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={e.approval_status} />
                  {e.approval_status !== "approved" ? (
                    <Button size="sm" onClick={() => approveEquipment.mutate(e._id)} disabled={approveEquipment.isPending}>
                      Approve
                    </Button>
                  ) : null}
                  {e.approval_status !== "rejected" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectEquipment.mutate({ id: e._id })}
                      disabled={rejectEquipment.isPending}
                    >
                      Reject
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
