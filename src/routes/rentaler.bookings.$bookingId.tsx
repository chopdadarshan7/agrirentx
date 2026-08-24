import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Phone } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/data";
import { qk } from "@/lib/query-keys";
import { getBooking } from "@/lib/api/bookings";
import { useApproveBooking, useRejectBooking, useCompleteBooking } from "@/hooks/queries/use-bookings";

export const Route = createFileRoute("/rentaler/bookings/$bookingId")({
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
  const { booking } = Route.useLoaderData();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const completeBooking = useCompleteBooking();

  const equipment = typeof booking.equipment_id === "string" ? null : booking.equipment_id;
  const farmer = typeof booking.farmer_id === "string" ? null : booking.farmer_id;
  const days = booking.total_days;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/rentaler/bookings">
          <ArrowLeft className="size-4" />
          Back to bookings
        </Link>
      </Button>

      <PageHeader
        title={equipment?.title ?? "Booking"}
        description={`Booking ${booking._id}`}
        actions={
          <div className="flex gap-2">
            <StatusBadge status={booking.booking_status} />
            <StatusBadge status={booking.payment_status} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Rental details">
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              [
                "Rental window",
                `${new Date(booking.start_date).toLocaleDateString()} – ${new Date(booking.end_date).toLocaleDateString()}`,
              ],
              ["Duration", `${days} day${days > 1 ? "s" : ""}`],
              ["Rental amount", inr(booking.total_amount)],
              [
                "Pickup & delivery",
                booking.delivery_required ? `Delivery — ${booking.delivery_address ?? "—"}` : "Self pickup",
              ],
              ["Booking ID", booking._id],
              ["Booked on", new Date(booking.createdAt).toLocaleDateString()],
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
            <p className="text-sm font-medium">{farmer?.fullName ?? "Farmer"}</p>
            {equipment ? <p className="text-sm text-muted-foreground">Rented {equipment.title}</p> : null}
            {booking.contact_phone ? (
              <p className="mt-1 text-sm text-muted-foreground">Contact: {booking.contact_phone}</p>
            ) : null}
            {booking.contact_phone ?? farmer?.phone ? (
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <a href={`tel:${booking.contact_phone ?? farmer?.phone}`}>
                  <Phone className="size-4" />
                  Contact renter
                </a>
              </Button>
            ) : null}
          </SectionCard>

          {booking.booking_status === "confirmed" ? (
            <SectionCard title="Respond to request">
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => approveBooking.mutate(booking._id)} disabled={approveBooking.isPending}>
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => rejectBooking.mutate({ id: booking._id })}
                  disabled={rejectBooking.isPending}
                >
                  Reject
                </Button>
              </div>
            </SectionCard>
          ) : booking.booking_status === "active" ? (
            <SectionCard title="Rental in progress">
              <Button className="w-full" onClick={() => completeBooking.mutate(booking._id)} disabled={completeBooking.isPending}>
                Mark as completed
              </Button>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
