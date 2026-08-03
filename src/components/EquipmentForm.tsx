import { Link } from "@tanstack/react-router";
import { ImagePlus, Info, Upload } from "lucide-react";
import { SectionCard } from "@/components/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, type Equipment } from "@/lib/data";

export function EquipmentForm({ equipment }: { equipment?: Equipment }) {
  const editing = Boolean(equipment);

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {editing ? (
        <p className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Saving changes sets this listing back to <strong>pending approval</strong>. It stays
          bookable until an admin reviews the edit.
        </p>
      ) : null}

      <SectionCard title="1. Basics" description="What are you listing?">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Equipment title</Label>
            <Input id="title" defaultValue={equipment?.title} placeholder="Mahindra 575 DI XP Plus" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select defaultValue={equipment?.category ?? categories[0]?.slug}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">Manufacturing year</Label>
            <Input id="year" type="number" placeholder="2021" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={4}
              defaultValue={equipment?.description}
              placeholder="Condition, service history, what it's best suited for…"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="2. Specifications" description="Add the specs farmers filter on">
        <div className="space-y-3">
          {(equipment?.specs ?? [{ label: "", value: "" }, { label: "", value: "" }]).map((s, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Spec name (e.g. Engine power)" defaultValue={s.label} />
              <Input placeholder="Value (e.g. 45 HP)" defaultValue={s.value} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm">
            Add another spec
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="3. Pricing" description="Daily rate and refundable deposit">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price per day (₹)</Label>
            <Input id="price" type="number" defaultValue={equipment?.pricePerDay} placeholder="2400" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deposit">Refundable deposit (₹)</Label>
            <Input id="deposit" type="number" defaultValue={equipment?.deposit} placeholder="5000" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="4. Location" description="Where the machine is picked up from">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["village", "Village / locality"],
            ["taluka", "Taluka"],
            ["district", "District"],
            ["state", "State"],
            ["pincode", "PIN code"],
            ["gps", "GPS coordinates (optional)"],
          ].map(([id, label]) => (
            <div key={id} className="space-y-1.5">
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                defaultValue={
                  id === "district" ? equipment?.district : id === "state" ? equipment?.state : undefined
                }
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="5. Photos & documents" description="Clear photos get up to 3× more bookings">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground hover:bg-muted">
            <ImagePlus className="size-6" />
            Upload up to 6 photos
            <input type="file" accept="image/*" multiple className="hidden" />
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground hover:bg-muted">
            <Upload className="size-6" />
            Ownership document (RC / invoice)
            <input type="file" accept="image/*,application/pdf" className="hidden" />
          </label>
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg">
          {editing ? "Save changes" : "Submit for approval"}
        </Button>
        <Button type="button" variant="outline" size="lg" asChild>
          <Link to="/rentaler/equipment">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
