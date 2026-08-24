import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import { qk } from "@/lib/query-keys";
import { getBooking } from "@/lib/api/bookings";
import { useCreateReview } from "@/hooks/queries/use-reviews";
import { useRetryPayment } from "@/hooks/queries/use-payments";

export const Route = createFileRoute("/farmer/bookings/$bookingId")({
  loader: async ({ params, context }) => {
    try {
      const booking = await context.queryClient.ensureQueryData({
        queryKey: qk.bookingDetail(params.bookingId),
        queryFn: () => getBooking(params.bookingId),
      });
      return { booking };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Booking unavailable — AgriRentX" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [{ title: "Booking details — AgriRentX" }, { name: "robots", content: "noindex" }],
    };
  },
  component: BookingDetailsPage,
});

function BookingDetailsPage() {
  const { booking } = Route.useLoaderData();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const createReview = useCreateReview();
  const retryPayment = useRetryPayment();

  const equipment = typeof booking.equipment_id === "string" ? null : booking.equipment_id;
  const rentaler = typeof booking.rentaler_id === "string" ? null : booking.rentaler_id;
  const days = booking.total_days;

  const timeline: { label: string; at: string }[] = [
    { label: "Booking placed", at: new Date(booking.createdAt).toLocaleString() },
  ];
  if (booking.cancelled_at) {
    timeline.push({ label: "Cancelled", at: new Date(booking.cancelled_at).toLocaleString() });
  }
  if (booking.completed_at) {
    timeline.push({ label: "Completed", at: new Date(booking.completed_at).toLocaleString() });
  }

  const submitReview = () => {
    createReview.mutate({ booking_id: booking._id, rating, review: reviewText });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={equipment?.title ?? "Booking"}
        description={`Booking ${booking._id} · placed ${new Date(booking.createdAt).toLocaleDateString()}`}
        actions={<StatusBadge status={booking.booking_status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Booking summary">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  "Rental window",
                  `${new Date(booking.start_date).toLocaleDateString()} → ${new Date(booking.end_date).toLocaleDateString()}`,
                ],
                ["Duration", `${days} day${days > 1 ? "s" : ""}`],
                ["Equipment owner", rentaler?.fullName ?? "—"],
                ["Contact number", booking.contact_phone ?? "—"],
                [
                  "Pickup & delivery",
                  booking.delivery_required ? `Delivery — ${booking.delivery_address ?? "—"}` : "Self pickup",
                ],
                ["Booking ID", booking._id],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Status timeline">
            <ol className="relative space-y-5 border-l border-border pl-5">
              {timeline.map((t) => (
                <li key={t.label} className="relative">
                  <span className="absolute -left-[1.6rem] top-1 size-2.5 rounded-full bg-primary ring-4 ring-card" />
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.at}</p>
                </li>
              ))}
            </ol>
          </SectionCard>

          {booking.delivery_required ? (
            <SectionCard title="Delivery tracking">
              {booking.logistics_status === "awaiting_delivery" && booking.delivery_otp ? (
                <div className="rounded-md bg-primary/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Share this OTP with the rentaler when the equipment arrives
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-[0.3em] text-primary">{booking.delivery_otp}</p>
                </div>
              ) : booking.logistics_status === "delivered" && booking.return_otp ? (
                <div className="rounded-md bg-primary/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Give this OTP to the rentaler when they collect the equipment
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-[0.3em] text-primary">{booking.return_otp}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {booking.logistics_status === "returned"
                      ? "Equipment returned."
                      : "Waiting on the rentaler to start delivery."}
                  </p>
                  <StatusBadge
                    status={booking.logistics_status ?? "awaiting_delivery"}
                    label={
                      booking.logistics_status === "delivered"
                        ? "With you"
                        : booking.logistics_status === "returned"
                          ? "Returned"
                          : "Awaiting delivery"
                    }
                  />
                </div>
              )}
            </SectionCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <SectionCard title="Payment summary">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rental ({days} × day rate)</dt>
                <dd>{inr(booking.base_amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Security deposit</dt>
                <dd>{inr(booking.deposit_amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Platform fee</dt>
                <dd>{inr(booking.platform_fee)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-base font-semibold">
                <dt>Total</dt>
                <dd>{inr(booking.total_amount)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={booking.payment_status} />
                </dd>
              </div>
            </dl>

            {booking.booking_status === "pending_payment" ? (
              <p className="mt-4 text-xs text-muted-foreground">
                This booking is awaiting payment. If checkout didn't complete, go back to the
                equipment page and book again, or use the retry option from your payment history.
              </p>
            ) : null}
            {booking.payment_status === "failed" ? (
              <Button
                className="mt-4 w-full"
                onClick={() => retryPayment.mutate(booking._id)}
                disabled={retryPayment.isPending}
              >
                Retry payment
              </Button>
            ) : null}
          </SectionCard>

          {booking.booking_status === "completed" ? (
            <SectionCard title="Rate this rental">
              <p className="text-sm text-muted-foreground">
                Your review helps other farmers pick the right machine.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4 w-full">Write a review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review {equipment?.title ?? "this equipment"}</DialogTitle>
                    <DialogDescription>
                      Rate the machine and the owner's service for this booking.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                        <Star
                          className={cn("size-7", n <= rating ? "fill-warning text-warning" : "text-border")}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="How did the equipment perform?"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <DialogFooter>
                    <Button onClick={submitReview} disabled={rating === 0 || createReview.isPending}>
                      Submit review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SectionCard>
          ) : (
            <SectionCard title="Review">
              <p className="text-sm text-muted-foreground">
                You can review this equipment once the rental is marked completed.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
