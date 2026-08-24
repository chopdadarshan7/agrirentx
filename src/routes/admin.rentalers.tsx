import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useAdminPendingRentalers,
  useAdminApprovedRentalers,
  useAdminUsers,
  useApproveRentaler,
  useRejectRentaler,
} from "@/hooks/queries/use-admin";

export const Route = createFileRoute("/admin/rentalers")({
  head: () => ({
    meta: [
      { title: "Rentaler Approvals — AgriRentX Admin" },
      { name: "description", content: "Verify ownership documents and approve or reject rentalers." },
      { property: "og:title", content: "Rentaler Approvals — AgriRentX Admin" },
      { property: "og:description", content: "Moderate who can list equipment on the platform." },
    ],
  }),
  component: AdminRentalersPage,
});

const tabs = ["pending", "approved", "rejected"] as const;

function AdminRentalersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const { data: pending = [] } = useAdminPendingRentalers();
  const { data: approved = [] } = useAdminApprovedRentalers();
  const { data: allRentalers } = useAdminUsers({ role: "rentaler", limit: 100 });
  const rejected = (allRentalers?.items ?? []).filter((u) => u.rentaler_status === "rejected");
  const approveRentaler = useApproveRentaler();
  const rejectRentaler = useRejectRentaler();

  const counts = { pending: pending.length, approved: approved.length, rejected: rejected.length };
  const list = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rentalers"
        description="Approve applications only after their details check out."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t} ({counts[t]})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="size-5" />}
          title={`No ${tab} rentalers`}
          message="Applications land here as soon as farmers submit their rentaler upgrade."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((u) => (
            <li key={u._id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium">{u.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {u.email}
                  {u.state ? ` · ${u.state}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={u.rentaler_status} />
                {u.rentaler_status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => approveRentaler.mutate(u._id)} disabled={approveRentaler.isPending}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectRentaler.mutate({ id: u._id })}
                      disabled={rejectRentaler.isPending}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
                {u.rentaler_status === "approved" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button size="sm" variant="outline" disabled>
                          Suspend
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Not yet supported — use Block on the Users page instead.</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
