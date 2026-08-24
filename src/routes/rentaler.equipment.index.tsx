import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarOff, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { inr } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { useMyEquipment, useDeleteEquipment } from "@/hooks/queries/use-equipment";
import { useEquipmentAvailability, useCreateAvailability, useDeleteAvailability } from "@/hooks/queries/use-availability";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function BlockDatesDialog({ equipmentId, equipmentTitle }: { equipmentId: string; equipmentTitle: string }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [reason, setReason] = useState("");
  const { data: blocks = [] } = useEquipmentAvailability(open ? equipmentId : undefined);
  const createBlock = useCreateAvailability();
  const deleteBlock = useDeleteAvailability();
  const blockedRanges = blocks.filter((b) => b.status !== "available");

  const handleAdd = () => {
    createBlock.mutate(
      { equipment_id: equipmentId, start_date: startDate, end_date: endDate, status: "blocked", reason },
      { onSuccess: () => setReason("") },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Block dates">
          <CalendarOff className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block dates — {equipmentTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {blockedRanges.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
              {blockedRanges.map((b) => (
                <li key={b._id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5">
                  <span>
                    {new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}
                    {b.reason ? ` · ${b.reason}` : ""}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    aria-label="Remove block"
                    onClick={() => deleteBlock.mutate({ id: b._id, equipmentId })}
                    disabled={deleteBlock.isPending}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No blocked dates yet.</p>
          )}

          <div className="space-y-3 border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="block-start">Start date</Label>
                <Input
                  id="block-start"
                  type="date"
                  value={startDate}
                  min={todayIso()}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="block-end">End date</Label>
                <Input
                  id="block-end"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block-reason">Reason (optional)</Label>
              <Input
                id="block-reason"
                placeholder="e.g. Under maintenance"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={createBlock.isPending}>
              {createBlock.isPending ? "Blocking…" : "Block these dates"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/rentaler/equipment/")({
  head: () => ({
    meta: [
      { title: "My Equipment — AgriRentX" },
      { name: "description", content: "Manage your listings and approval status." },
      { property: "og:title", content: "My Equipment — AgriRentX" },
      { property: "og:description", content: "Edit and manage your equipment listings." },
    ],
  }),
  component: MyEquipmentsPage,
});

function MyEquipmentsPage() {
  const { user } = useAuth();
  const { data } = useMyEquipment(user?._id);
  const listings = data?.items ?? [];
  const deleteEquipment = useDeleteEquipment();

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
          message="Add your first machine to start receiving booking requests."
          action={
            <Button asChild>
              <Link to="/rentaler/equipment/new">Add equipment</Link>
            </Button>
          }
        />
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Price / day</TableHead>
                <TableHead>Listing status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((e) => (
                <TableRow key={e._id}>
                  <TableCell>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.location.district ?? e.location.address}
                    </p>
                  </TableCell>
                  <TableCell>{inr(e.price_per_day)}</TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.approval_status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit listing" asChild>
                        <Link to="/rentaler/equipment/$equipmentId/edit" params={{ equipmentId: e._id }}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <BlockDatesDialog equipmentId={e._id} equipmentTitle={e.title} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Delete listing" className="text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
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
                            <AlertDialogAction onClick={() => deleteEquipment.mutate(e._id)}>
                              Delete listing
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
