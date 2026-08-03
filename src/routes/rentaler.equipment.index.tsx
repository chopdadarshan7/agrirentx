import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarX2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { EmptyState, PageHeader, SectionCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { equipments, inr } from "@/lib/data";

export const Route = createFileRoute("/rentaler/equipment/")({
  head: () => ({
    meta: [
      { title: "My Equipment — AgriRentX" },
      { name: "description", content: "Manage your listings, availability blocks and approval status." },
      { property: "og:title", content: "My Equipment — AgriRentX" },
      { property: "og:description", content: "Edit listings and block maintenance dates." },
    ],
  }),
  component: MyEquipmentsPage,
});

const blockedDates = [
  { id: "AV-1", equipment: "Mahindra 575 DI XP Plus", range: "18 Aug – 21 Aug 2026", reason: "Service & oil change" },
  { id: "AV-2", equipment: "Sonalika DI 60 RX Tractor", range: "2 Sep – 4 Sep 2026", reason: "Own field work" },
];

function MyEquipmentsPage() {
  const listings = equipments.filter((e) => e.owner === "Rajesh Patil");

  return (
    <div className="space-y-6">
      <PageHeader
        title="My equipment"
        description="Listing status and approval status are independent — an approved machine can still be under maintenance."
        actions={
          <Button asChild>
            <Link to="/rentaler/equipment/new">
              <PlusCircle className="size-4" />
              Add equipment
            </Link>
          </Button>
        }
      />

      {listings.length === 0 ? (
        <EmptyState
          icon={<PlusCircle className="size-5" />}
          title="No listings yet"
          message="Add your first machine — most listings are verified and live within two working days."
          action={
            <Button asChild>
              <Link to="/rentaler/equipment/new">Add equipment</Link>
            </Button>
          }
        />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Equipment</th>
                <th className="px-5 py-3 font-medium">Price / day</th>
                <th className="px-5 py-3 font-medium">Listing status</th>
                <th className="px-5 py-3 font-medium">Approval</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((e) => {
                const locked = e.activeBookings > 0;
                return (
                  <tr key={e.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.categoryName} · {e.district}
                      </p>
                    </td>
                    <td className="px-5 py-3">{inr(e.pricePerDay)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={e.approvalStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit listing" asChild>
                          <Link to="/rentaler/equipment/$equipmentId/edit" params={{ equipmentId: e.id }}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Delete listing"
                                    disabled={locked}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </span>
                            </TooltipTrigger>
                            {locked ? (
                              <TooltipContent>
                                Can't delete — {e.activeBookings} active booking
                                {e.activeBookings > 1 ? "s" : ""} on this machine
                              </TooltipContent>
                            ) : null}
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {e.title}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This removes the listing permanently. Past bookings and payouts stay
                                in your records.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep listing</AlertDialogCancel>
                              <AlertDialogAction>Delete listing</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <SectionCard
        title="Availability blocks"
        description="Dates marked unavailable for maintenance or your own field work"
        actions={
          <Button variant="outline" size="sm">
            <CalendarX2 className="size-4" />
            Block dates
          </Button>
        }
      >
        <ul className="divide-y divide-border">
          {blockedDates.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{b.equipment}</p>
                <p className="text-xs text-muted-foreground">{b.reason}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status="maintenance" label={b.range} />
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
