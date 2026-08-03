import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { users as seedUsers, type RentalerStatus } from "@/lib/data";

export const Route = createFileRoute("/admin/rentalers")({
  head: () => ({
    meta: [
      { title: "Rentaler Approvals — AgriRentX Admin" },
      { name: "description", content: "Verify ownership documents and approve, reject or suspend rentalers." },
      { property: "og:title", content: "Rentaler Approvals — AgriRentX Admin" },
      { property: "og:description", content: "Moderate who can list equipment on the platform." },
    ],
  }),
  component: AdminRentalersPage,
});

const tabs = ["pending", "approved", "rejected", "suspended"] as const;

function AdminRentalersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const [rows, setRows] = useState(seedUsers.filter((u) => u.rentalerStatus !== null));

  const setStatus = (id: string, status: RentalerStatus) =>
    setRows((list) =>
      list.map((u) => (u.id === id ? { ...u, rentalerStatus: status, isRentaler: status === "approved" } : u)),
    );

  const list = rows.filter((u) => u.rentalerStatus === tab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rentalers"
        description="Approve applications only after the ownership document matches the listed name."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t} ({rows.filter((u) => u.rentalerStatus === t).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="size-5" />}
          title={`No ${tab} rentalers`}
          message="Applications land here as soon as farmers submit their ownership documents."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((u) => (
            <li key={u.id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-muted-foreground">
                  {u.district} · {u.email} · joined {u.joined}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={u.rentalerStatus ?? "pending"} />
                {u.rentalerStatus === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => setStatus(u.id, "approved")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(u.id, "rejected")}>
                      Reject
                    </Button>
                  </>
                ) : null}
                {u.rentalerStatus === "approved" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Suspend
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Suspend {u.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Their listings are hidden immediately. Active bookings continue until completion.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setStatus(u.id, "suspended")}>
                          Suspend rentaler
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
                {u.rentalerStatus === "suspended" ? (
                  <Button size="sm" onClick={() => setStatus(u.id, "approved")}>
                    Reactivate
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
