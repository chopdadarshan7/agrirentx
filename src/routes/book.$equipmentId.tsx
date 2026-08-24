import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Info,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { PublicShell } from "@/components/SiteHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { toneFor } from "@/components/EquipmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import { getEquipment } from "@/lib/api/equipment";
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking } from "@/hooks/queries/use-bookings";
import { useCreateOrder, useVerifyPayment } from "@/hooks/queries/use-payments";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { getCurrentPosition, reverseGeocode } from "@/lib/geolocation";
import { ApiError } from "@/lib/api-client";
import type { Booking, EquipmentRentalerRef } from "@/types/models";

export const Route = createFileRoute("/book/$equipmentId")({
  ssr: false,
  beforeLoad: ({ location }) => {
    requireAuth(location);
  },
  loader: async ({ params, context }) => {
    try {
      const item = await context.queryClient.ensureQueryData({
        queryKey: qk.equipmentDetail(params.equipmentId),
        queryFn: () => getEquipment(params.equipmentId),
      });
      return { item };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Booking unavailable — AgriRentX" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Book ${loaderData.item.title} — AgriRentX`;
    const description = `Pick rental dates and delivery preference to book the ${loaderData.item.title} at ${inr(loaderData.item.price_per_day)} per day.`;
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
  contactPhone: string;
  deliveryAddress: string;
};

const dayMs = 86_400_000;
const todayIso = () => new Date().toISOString().slice(0, 10);
const fmt = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

function profileAddress(user: { address?: string; city?: string; state?: string; pincode?: string } | null) {
  if (!user) return "";
  return [user.address, user.city, user.state, user.pincode].filter(Boolean).join(", ");
}

function BookEquipmentPage() {
  const { item } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [form, setForm] = useState<Form>({
    from: todayIso(),
    to: todayIso(),
    delivery: "pickup",
    contactPhone: user?.phone ?? "",
    deliveryAddress: profileAddress(user),
  });
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const [detectingAddress, setDetectingAddress] = useState(false);

  const detectDeliveryLocation = async () => {
    setDetectingAddress(true);
    try {
      const pos = await getCurrentPosition();
      const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      const parts = [place.address, place.village, place.taluka, place.district, place.state, place.pincode].filter(
        Boolean,
      );
      if (parts.length === 0) {
        toast.error("Couldn't determine your address — enter it manually.");
        return;
      }
      set("deliveryAddress", parts.join(", "));
      toast.success("Delivery address filled in.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't detect your location.");
    } finally {
      setDetectingAddress(false);
    }
  };

  const createBooking = useCreateBooking();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const rentaler = typeof item.rentaler_id === "string" ? null : (item.rentaler_id as EquipmentRentalerRef);

  const days = useMemo(() => {
    const a = new Date(form.from).getTime();
    const b = new Date(form.to).getTime();
    if (!a || !b || b < a) return 0;
    return Math.max(1, Math.ceil((b - a) / dayMs));
  }, [form.from, form.to]);

  const rental = days * item.price_per_day;
  const total = booking?.total_amount ?? rental + item.security_deposit;
  const phoneValid = /^[6-9]\d{9}$/.test(form.contactPhone);
  const addressValid = form.delivery === "pickup" || form.deliveryAddress.trim().length > 0;
  const valid = days > 0 && phoneValid && addressValid;

  const startCheckout = async () => {
    setPayError(null);
    setIsPaying(true);
    try {
      let activeBooking = booking;
      if (!activeBooking) {
        activeBooking = await createBooking.mutateAsync({
          equipment_id: item._id,
          start_date: form.from,
          end_date: form.to,
          delivery_required: form.delivery === "delivery",
          delivery_address: form.delivery === "delivery" ? form.deliveryAddress.trim() : undefined,
          contact_phone: form.contactPhone,
        });
        setBooking(activeBooking);
      }

      const { payment, order } = await createOrder.mutateAsync(activeBooking._id);

      const result = await openRazorpayCheckout({
        amountPaise: Math.round(payment.amount * 100),
        currency: payment.currency,
        orderId: order.id,
        name: "AgriRentX",
        description: item.title,
        prefill: {
          name: user?.fullName ?? "",
          email: user?.email ?? "",
          contact: user?.phone ?? "",
        },
      });

      await verifyPayment.mutateAsync(result);
      toast.success("Payment successful — booking confirmed.");
      navigate({ to: "/farmer/bookings/$bookingId", params: { bookingId: activeBooking._id } });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Payment failed.";
      setPayError(message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleReviewSubmit = () => {
    setStep(2);
  };

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link
              to="/equipment/$equipmentId"
              params={{ equipmentId: item._id }}
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
                          min={todayIso()}
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
                  <Label htmlFor="contact-phone">Contact number</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.contactPhone}
                    onChange={(e) => set("contactPhone", e.target.value)}
                  />
                  {!phoneValid && form.contactPhone ? (
                    <p className="text-xs text-destructive">Enter a valid 10-digit mobile number.</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      So {rentaler?.fullName ?? "the rentaler"} can reach you about this booking.
                    </p>
                  )}
                </div>

                {form.delivery === "delivery" ? (
                  <div className="space-y-2">
                    <Label htmlFor="delivery-address">Delivery address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="delivery-address"
                        placeholder="Farm address, village, taluka"
                        value={form.deliveryAddress}
                        onChange={(e) => set("deliveryAddress", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={detectDeliveryLocation}
                        disabled={detectingAddress}
                      >
                        {detectingAddress ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <MapPin className="size-4" />
                        )}
                        Detect
                      </Button>
                    </div>
                    {!addressValid ? (
                      <p className="text-xs text-destructive">Enter a delivery address.</p>
                    ) : null}
                  </div>
                ) : null}

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
            ) : step === 1 ? (
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
                    ["Contact number", form.contactPhone],
                    ...(form.delivery === "delivery"
                      ? [["Delivery address", form.deliveryAddress]]
                      : []),
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-6 px-4 py-3 text-sm">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="max-w-[60%] text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="flex items-start gap-2 rounded-md bg-muted px-4 py-3 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  Confirming sends the request to {rentaler?.fullName ?? "the rentaler"}. You pay now
                  and the booking is confirmed once payment succeeds.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button size="lg" onClick={handleReviewSubmit}>
                    Continue to Payment <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Payment</h2>
                  <Button variant="outline" size="sm" onClick={() => setStep(1)} disabled={isPaying}>
                    <Pencil className="size-4" /> Back to review
                  </Button>
                </div>

                {payError ? (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
                  >
                    {payError}
                  </p>
                ) : null}

                <p className="text-sm text-muted-foreground">
                  Clicking below opens Razorpay checkout for {inr(total)}. Your booking is held as
                  pending until payment completes.
                </p>

                <Button size="lg" className="w-full" onClick={startCheckout} disabled={isPaying}>
                  {isPaying ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>Pay {inr(total)} now</>
                  )}
                </Button>
              </div>
            )}
          </section>

          <aside className="space-y-6 lg:sticky lg:top-22 lg:self-start">
            <div className="surface-card p-5">
              <h2 className="text-base font-semibold">Equipment Summary</h2>
              <div className="mt-4 flex gap-4">
                <div
                  className={cn("size-24 shrink-0 rounded-md bg-gradient-to-br", toneFor(item._id))}
                  aria-hidden
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-lg font-semibold">
                    {inr(item.price_per_day)}{" "}
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
                    Rental Charges ({inr(item.price_per_day)} × {days} days)
                  </dt>
                  <dd className="font-medium">{inr(booking?.base_amount ?? rental)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Security deposit</dt>
                  <dd className="font-medium">{inr(booking?.deposit_amount ?? item.security_deposit)}</dd>
                </div>
                {booking ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Platform fee</dt>
                    <dd className="font-medium">{inr(booking.platform_fee)}</dd>
                  </div>
                ) : null}
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
