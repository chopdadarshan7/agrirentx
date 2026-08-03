import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { ArrowLeft, Phone } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { bookings, inr } from "@/lib/data";

export const Route = createFileRoute("/rentaler/bookings/$bookingId")({
  head: () => ({
    meta: [
      { title: "Booking Details — AgriRentX" },
      { name: "description", content: "Renter details, rental window and payout status for this booking." },
      { property: "og:title", content: "Booking Details — AgriRentX" },
      { property: "og:description", content: "Review a rental request in detail." },
    ],
  }),
  component: RentalerBookingDetail,
});

function RentalerBookingDetail() {
  const { bookingId } = useParams({ from: "/rentaler/bookings/$bookingId" });
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) throw notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/rentaler/bookings">
          <ArrowLeft className="size-4" />
          Back to bookings
        </Link>
      </Button>

      <PageHeader
        title={booking.equipmentTitle}
        description={`Booking ${booking.id}`}
        actions={
          <div className="flex gap-2">
            <StatusBadge status={booking.status} />
            <StatusBadge status={booking.paymentStatus} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Rental details">
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Rental window", `${booking.from} – ${booking.to}`],
              ["Duration", `${booking.days} day${booking.days > 1 ? "s" : ""}`],
              ["Rental amount", inr(booking.amount)],
              ["Booking ID", booking.id],
              ["Booked on", booking.placedAt],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Renter">
            <p className="text-sm font-medium">{booking.farmer}</p>
            <p className="text-sm text-muted-foreground">{booking.farmerLocation}</p>
            <Button variant="outline" size="sm" className="mt-3">
              <Phone className="size-4" />
              {booking.farmerPhone}
            </Button>
          </SectionCard>

          {booking.status === "pending" ? (
            <SectionCard title="Respond to request">
              <div className="flex gap-2">
                <Button className="flex-1">Approve</Button>
                <Button variant="outline" className="flex-1">
                  Reject
                </Button>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
