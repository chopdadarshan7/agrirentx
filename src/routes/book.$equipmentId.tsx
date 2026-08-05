import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Crosshair,
  Info,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { PublicShell } from "@/components/SiteHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEquipment, inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/book/$equipmentId")({
  loader: ({ params }) => {
    const item = getEquipment(params.equipmentId);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Booking unavailable — AgriRentX" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Book ${loaderData.item.title} — AgriRentX`;
    const description = `Pick rental dates, delivery and contact details to book the ${loaderData.item.title} at ${inr(loaderData.item.pricePerDay)} per day.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BookEquipmentPage,
});

const steps = ["Booking Details", "Review", "Payment"];
const purposes = [
  "Sowing / Planting",
  "Ploughing / Tillage",
  "Harvesting",
  "Spraying",
  "Irrigation",
  "Haulage / Transport",
];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-start gap-0">
      {steps.map((label, i) => {
        const done = i <= current;
        return (
          <li key={label} className="flex items-start">
            <div className="flex w-24 flex-col items-center gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border text-sm font-semibold",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "text-center text-xs font-medium",
                  done ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  "mt-4.5 h-0.5 w-10 sm:w-20",
                  i < current ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

type Form = {
  from: string;
  to: string;
  delivery: "pickup" | "delivery";
  location: string;
  phone: string;
  purpose: string;
  message: string;
};

const dayMs = 86_400_000;
const fmt = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

function BookEquipmentPage() {
  const { item } = Route.useLoaderData();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({
    from: "2026-08-12",
    to: "2026-08-18",
    delivery: "pickup",
    location: "",
    phone: "+91 98765 43210",
    purpose: purposes[0],
    message: "",
  });
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const days = useMemo(() => {
    const a = new Date(form.from).getTime();
    const b = new Date(form.to).getTime();
    if (!a || !b || b < a) return 0;
    return Math.max(1, Math.round((b - a) / dayMs));
  }, [form.from, form.to]);

  const rental = days * item.pricePerDay;
  const deliveryFee = form.delivery === "delivery" ? 1500 : 0;
  const total = rental + deliveryFee;
  const valid = days > 0 && form.phone.trim().length >= 10;

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link
              to="/equipment/$equipmentId"
              params={{ equipmentId: item.id }}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-4" /> Back to equipment
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">Book Equipment</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in the details to book this equipment
            </p>
          </div>
          <div className="w-full overflow-x-auto sm:w-auto">
            <Stepper current={step} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <section className="surface-card p-6">
            {step === 0 ? (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Booking Details</h2>

                <div className="space-y-2">
                  <Label>Rental Period</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-52 flex-1 rounded-md border border-border px-3 py-2">
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="date"
                          value={form.from}
                          onChange={(e) => set("from", e.target.value)}
                          className="h-8 border-0 px-0 font-medium shadow-none focus-visible:ring-0"
                        />
                        <CalendarIcon className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                    <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
                    <div className="min-w-52 flex-1 rounded-md border border-border px-3 py-2">
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="date"
                          value={form.to}
                          min={form.from}
                          onChange={(e) => set("to", e.target.value)}
                          className="h-8 border-0 px-0 font-medium shadow-none focus-visible:ring-0"
                        />
                        <CalendarIcon className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      days > 0 ? "text-primary" : "text-destructive",
                    )}
                  >
                    {days > 0 ? `${days} days` : "End date must be after the start date"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Pickup &amp; Delivery</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["pickup", "Self Pickup", "I will pickup the equipment"],
                        ["delivery", "Delivery Required", "Get it delivered to your location"],
                      ] as const
                    ).map(([value, title, sub]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set("delivery", value)}
                        className={cn(
                          "flex items-start gap-3 rounded-md border p-4 text-left transition-colors",
                          form.delivery === value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/60",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-4.5 items-center justify-center rounded-full border-2",
                            form.delivery === value ? "border-primary" : "border-border",
                          )}
                        >
                          {form.delivery === value ? (
                            <span className="size-2 rounded-full bg-primary" />
                          ) : null}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{title}</span>
                          <span className="block text-xs text-muted-foreground">{sub}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/40 bg-primary/5 p-4">
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 text-primary" />
                      <span>
                        <span className="block text-sm font-semibold text-primary">
                          Use my current location
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Detect your current location using your browser
                        </span>
                      </span>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        set("location", "Nashik, Maharashtra");
                        toast.success("Location detected");
                      }}
                    >
                      <Crosshair className="size-4" /> Detect Location
                    </Button>
                  </div>
                  <Input
                    id="location"
                    placeholder="Village, district, state"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-9"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We will use this number for booking updates and communication
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Purpose of Use</Label>
                  <Select value={form.purpose} onValueChange={(v) => set("purpose", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message to Owner (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Write a message..."
                    maxLength={250}
                    rows={4}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {form.message.length}/250
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-info/10 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="size-4 text-info" /> Booking is subject to rentaler&apos;s
                    approval.
                  </p>
                  <Button size="lg" disabled={!valid} onClick={() => setStep(1)}>
                    Continue to Review <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Review Booking</h2>
                  <Button variant="outline" size="sm" onClick={() => setStep(0)}>
                    <Pencil className="size-4" /> Edit details
                  </Button>
                </div>

                <dl className="divide-y divide-border rounded-md border border-border">
                  {[
                    ["Rental period", `${fmt(form.from)} → ${fmt(form.to)} (${days} days)`],
                    [
                      "Pickup & delivery",
                      form.delivery === "pickup" ? "Self pickup" : "Delivery required",
                    ],
                    ["Location", form.location || "Not provided"],
                    ["Contact number", form.phone],
                    ["Purpose of use", form.purpose],
                    ["Message to owner", form.message || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-6 px-4 py-3 text-sm">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="max-w-[60%] text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="flex items-start gap-2 rounded-md bg-muted px-4 py-3 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  Confirming sends the request to {item.owner}. You are charged only after the
                  rentaler approves the booking.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      setStep(2);
                      toast.info("Payment step is coming soon");
                    }}
                  >
                    Pay Now <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6 lg:sticky lg:top-22 lg:self-start">
            <div className="surface-card p-5">
              <h2 className="text-base font-semibold">Equipment Summary</h2>
              <div className="mt-4 flex gap-4">
                <div
                  className={cn("size-24 shrink-0 rounded-md bg-gradient-to-br", item.tone)}
                  aria-hidden
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-lg font-semibold">
                    {inr(item.pricePerDay)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">/ day</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Excludes fuel</p>
                </div>
              </div>
            </div>

            <div className="surface-card p-5">
              <h2 className="text-base font-semibold">Price Details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Rental Charges ({inr(item.pricePerDay)} × {days} days)
                  </dt>
                  <dd className="font-medium">{inr(rental)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery Charges</dt>
                  <dd className="font-medium">{inr(deliveryFee)}</dd>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <dt className="text-base font-semibold">Total Amount</dt>
                  <dd className="text-xl font-semibold text-primary">{inr(total)}</dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-2 rounded-md bg-primary/5 px-3 py-3 text-xs font-medium text-primary">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                Your payment will be held securely and released only after the rental is completed.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
