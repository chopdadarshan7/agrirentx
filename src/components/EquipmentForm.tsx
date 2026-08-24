import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, Info, Loader2, MapPin, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SectionCard } from "@/components/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/queries/use-categories";
import { useCreateEquipment, useUpdateEquipment } from "@/hooks/queries/use-equipment";
import { equipmentSchema, type EquipmentFormValues } from "@/lib/validation/equipment";
import { getCurrentPosition, reverseGeocode } from "@/lib/geolocation";
import type { Equipment, EquipmentCategoryRef } from "@/types/models";

function toDefaultValues(equipment?: Equipment): EquipmentFormValues {
  if (!equipment) {
    return {
      title: "",
      category_id: "",
      description: "",
      price_per_day: 0,
      security_deposit: 0,
      location: { address: "", village: "", taluka: "", district: "", state: "", pincode: "", latitude: 0, longitude: 0 },
      specs: [{ label: "", value: "" }],
      images: [],
    };
  }
  const categoryId = typeof equipment.category_id === "string" ? equipment.category_id : (equipment.category_id as EquipmentCategoryRef)._id;
  const specs = Object.entries(equipment.specifications ?? {}).map(([label, value]) => ({ label, value }));
  return {
    title: equipment.title,
    category_id: categoryId,
    description: equipment.description,
    price_per_day: equipment.price_per_day,
    security_deposit: equipment.security_deposit,
    location: {
      address: equipment.location.address ?? "",
      village: equipment.location.village ?? "",
      taluka: equipment.location.taluka ?? "",
      district: equipment.location.district ?? "",
      state: equipment.location.state ?? "",
      pincode: equipment.location.pincode ?? "",
      latitude: equipment.location.latitude,
      longitude: equipment.location.longitude,
    },
    specs: specs.length > 0 ? specs : [{ label: "", value: "" }],
    images: [],
  };
}

export function EquipmentForm({ equipment }: { equipment?: Equipment }) {
  const editing = Boolean(equipment);
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: toDefaultValues(equipment),
  });
  const specFields = useFieldArray({ control: form.control, name: "specs" });

  const [detecting, setDetecting] = useState(false);

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const pos = await getCurrentPosition();
      form.setValue("location.latitude", pos.coords.latitude);
      form.setValue("location.longitude", pos.coords.longitude);

      try {
        const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (place.address) form.setValue("location.address", place.address);
        if (place.village) form.setValue("location.village", place.village);
        if (place.taluka) form.setValue("location.taluka", place.taluka);
        if (place.district) form.setValue("location.district", place.district);
        if (place.state) form.setValue("location.state", place.state);
        if (place.pincode) form.setValue("location.pincode", place.pincode);
        toast.success("Location detected and address filled in.");
      } catch {
        toast.success("Location detected — fill in the address fields manually.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't detect your location.");
    } finally {
      setDetecting(false);
    }
  };

  const onSubmit = async (values: EquipmentFormValues) => {
    try {
      if (equipment) {
        await updateEquipment.mutateAsync({ id: equipment._id, input: values });
      } else {
        await createEquipment.mutateAsync(values);
      }
      navigate({ to: "/rentaler/equipment" });
    } catch {
      // error toast already shown by the mutation hook
    }
  };

  const isSaving = createEquipment.isPending || updateEquipment.isPending;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {editing ? (
          <p className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            Saving changes sets this listing back to <strong>pending approval</strong>. It stays
            bookable until an admin reviews the edit.
          </p>
        ) : null}

        <SectionCard title="1. Basics" description="What are you listing?">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Equipment title</FormLabel>
                  <FormControl>
                    <Input placeholder="Mahindra 575 DI XP Plus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Condition, service history, what it's best suited for…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        <SectionCard title="2. Specifications" description="Add the specs farmers filter on">
          <div className="space-y-3">
            {specFields.fields.map((f, i) => (
              <div key={f.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  placeholder="Spec name (e.g. Engine power)"
                  {...form.register(`specs.${i}.label` as const)}
                />
                <Input placeholder="Value (e.g. 45 HP)" {...form.register(`specs.${i}.value` as const)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => specFields.remove(i)}
                  aria-label="Remove spec"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => specFields.append({ label: "", value: "" })}>
              Add another spec
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="3. Pricing" description="Daily rate and refundable deposit">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price_per_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per day (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="security_deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refundable deposit (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        <SectionCard title="4. Location" description="Where the machine is picked up from">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village / locality</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.taluka"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taluka</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="space-y-1.5 sm:col-span-2">
              <Label>GPS coordinates</Label>
              <div className="flex flex-wrap items-center gap-2">
                <FormField
                  control={form.control}
                  name="location.latitude"
                  render={({ field }) => <Input type="number" step="any" placeholder="Latitude" className="max-w-40" {...field} />}
                />
                <FormField
                  control={form.control}
                  name="location.longitude"
                  render={({ field }) => <Input type="number" step="any" placeholder="Longitude" className="max-w-40" {...field} />}
                />
                <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={detecting}>
                  {detecting ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                  {detecting ? "Detecting…" : "Detect location"}
                </Button>
              </div>
              {form.formState.errors.location?.latitude || form.formState.errors.location?.longitude ? (
                <p className="text-xs text-destructive">Valid coordinates are required.</p>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="5. Photos" description="Clear photos get up to 3× more bookings">
          <FormField
            control={form.control}
            name="images"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground hover:bg-muted">
                    <ImagePlus className="size-6" />
                    {value.length > 0 ? `${value.length} photo(s) selected` : "Upload up to 10 photos"}
                    {editing ? <span className="text-xs">Leave empty to keep existing photos</span> : null}
                    <input
                      {...field}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => onChange(Array.from(e.target.files ?? []))}
                    />
                  </label>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </SectionCard>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            {editing ? "Save changes" : "Submit for approval"}
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <Link to="/rentaler/equipment">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
