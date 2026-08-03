import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
import { getBooking, inr } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/bookings/$bookingId")({
  loader: ({ params }) => {
    const booking = getBooking(params.bookingId);
    if (!booking) throw notFound();
    return { booking };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Booking unavailable — AgriRentX" }, { name: "robots", content: "noindex" }] };
    }
    const title = `Booking ${loaderData.booking.id} — AgriRentX`;
    return {
      meta: [
        { title },
        { name: "description", content: `Details for ${loaderData.booking.equipmentTitle}.` },
        { property: "og:title", content: title },
        { property: "og:description", content: "Booking summary, payment and status timeline." },
      ],
    };
  },
  component: BookingDetailsPage,
});

function BookingDetailsPage() {
  const { booking } = Route.useLoaderData();
  const [rating, setRating] = useState(0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={booking.equipmentTitle}
        description={`Booking ${booking.id} · placed ${booking.placedAt}`}
        actions={<StatusBadge status={booking.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Booking summary">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Rental window", `${booking.from} → ${booking.to}`],
                ["Duration", `${booking.days} day${booking.days > 1 ? "s" : ""}`],
                ["Equipment owner", booking.rentaler],
                ["Booking ID", booking.id],
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
              {booking.timeline.map((t: { label: string; at: string; note?: string }) => (
                <li key={t.label} className="relative">
                  <span className="absolute -left-[1.6rem] top-1 size-2.5 rounded-full bg-primary ring-4 ring-card" />
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.at}</p>
                  {t.note ? <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p> : null}
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Payment summary">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Rental ({booking.days} × day rate)
                </dt>
                <dd>{inr(booking.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Platform fee</dt>
                <dd>{inr(Math.round(booking.amount * 0.02))}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-base font-semibold">
                <dt>Total paid</dt>
                <dd>{inr(booking.amount + Math.round(booking.amount * 0.02))}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={booking.paymentStatus} />
                </dd>
              </div>
            </dl>

            {booking.paymentStatus === "failed" ? (
              <Button className="mt-4 w-full" asChild>
                <Link to="/payment/failed">Retry payment</Link>
              </Button>
            ) : null}
          </SectionCard>

          {booking.status === "completed" ? (
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
                    <DialogTitle>Review {booking.equipmentTitle}</DialogTitle>
                    <DialogDescription>
                      Rate the machine and the owner's service for booking {booking.id}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                        <Star
                          className={cn(
                            "size-7",
                            n <= rating ? "fill-warning text-warning" : "text-border",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea placeholder="How did the equipment perform?" rows={4} />
                  <DialogFooter>
                    <Button>Submit review</Button>
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
