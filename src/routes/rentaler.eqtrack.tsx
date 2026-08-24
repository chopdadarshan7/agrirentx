import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, MapPin, PackageCheck, Truck } from "lucide-react";
import { EmptyState, PageHeader, SectionCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useRentalerBookings,
  useGenerateDeliveryOtp,
  useVerifyDeliveryOtp,
  useGenerateReturnOtp,
  useVerifyReturnOtp,
} from "@/hooks/queries/use-bookings";
import type { Booking } from "@/types/models";

export const Route = createFileRoute("/rentaler/eqtrack")({
  head: () => ({
    meta: [
      { title: "EqTrack — AgriRentX" },
      { name: "description", content: "Track equipment out for delivery and confirm returns with OTP handoffs." },
      { property: "og:title", content: "EqTrack — AgriRentX" },
      { property: "og:description", content: "Delivery and return tracking for your equipment." },
    ],
  }),
  component: EqTrackPage,
});

function OtpStep({
  label,
  onSend,
  onVerify,
  sending,
  verifying,
}: {
  label: string;
  onSend: () => void;
  onVerify: (otp: string) => void;
  sending: boolean;
  verifying: boolean;
}) {
  const [otp, setOtp] = useState("");

  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onSend} disabled={sending}>
          {sending ? "Sending…" : "Send OTP to farmer"}
        </Button>
        <div className="flex flex-1 min-w-48 gap-2">
          <Input
            placeholder="Enter OTP from farmer"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="h-9"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => onVerify(otp)}
            disabled={otp.length !== 6 || verifying}
          >
            {verifying ? "Confirming…" : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EqTrackCard({ booking }: { booking: Booking }) {
  const equipment = typeof booking.equipment_id === "string" ? null : booking.equipment_id;
  const farmer = typeof booking.farmer_id === "string" ? null : booking.farmer_id;
  const status = booking.logistics_status ?? "awaiting_delivery";

  const generateDeliveryOtp = useGenerateDeliveryOtp();
  const verifyDeliveryOtp = useVerifyDeliveryOtp();
  const generateReturnOtp = useGenerateReturnOtp();
  const verifyReturnOtp = useVerifyReturnOtp();

  const canTrack = booking.booking_status === "confirmed" || booking.booking_status === "active";

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{equipment?.title ?? "Equipment"}</p>
          <p className="text-sm text-muted-foreground">{farmer?.fullName ?? "Farmer"}</p>
          {booking.delivery_address ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {booking.delivery_address}
            </p>
          ) : null}
        </div>
        <StatusBadge
          status={status}
          label={
            status === "awaiting_delivery" ? "Awaiting delivery" : status === "delivered" ? "With farmer" : "Returned"
          }
        />
      </div>

      {!canTrack ? (
        <p className="mt-4 text-sm text-muted-foreground">
          This booking isn't confirmed yet — delivery tracking starts once it's confirmed.
        </p>
      ) : status === "awaiting_delivery" ? (
        <div className="mt-4">
          <OtpStep
            label="Confirm delivery — send the OTP, then enter what the farmer reads back to you."
            onSend={() => generateDeliveryOtp.mutate(booking._id)}
            onVerify={(otp) => verifyDeliveryOtp.mutate({ id: booking._id, otp })}
            sending={generateDeliveryOtp.isPending}
            verifying={verifyDeliveryOtp.isPending}
          />
        </div>
      ) : status === "delivered" ? (
        <div className="mt-4">
          <OtpStep
            label="Confirm return — send the OTP, then enter what the farmer gives you at pickup."
            onSend={() => generateReturnOtp.mutate(booking._id)}
            onVerify={(otp) => verifyReturnOtp.mutate({ id: booking._id, otp })}
            sending={generateReturnOtp.isPending}
            verifying={verifyReturnOtp.isPending}
          />
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <PackageCheck className="size-4 text-primary" />
          Returned {booking.returned_at ? new Date(booking.returned_at).toLocaleDateString() : ""}
        </p>
      )}
    </SectionCard>
  );
}

function EqTrackPage() {
  const { data: bookings = [] } = useRentalerBookings();
  const tracked = bookings.filter((b) => b.delivery_required);
  const inFlight = tracked.filter((b) => b.logistics_status !== "returned");
  const returned = tracked.filter((b) => b.logistics_status === "returned");

  return (
    <div className="space-y-6">
      <PageHeader
        title="EqTrack"
        description="OTP-confirmed delivery and return handoffs for equipment out with farmers."
      />

      {tracked.length === 0 ? (
        <EmptyState
          icon={<Truck className="size-5" />}
          title="Nothing to track yet"
          message="Bookings where the farmer chose delivery will show up here once confirmed."
        />
      ) : (
        <div className="space-y-4">
          {inFlight.map((b) => (
            <EqTrackCard key={b._id} booking={b} />
          ))}
          {returned.length > 0 ? (
            <details className="pt-2">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                {returned.length} returned booking{returned.length > 1 ? "s" : ""}
              </summary>
              <div className="mt-3 space-y-4">
                {returned.map((b) => (
                  <EqTrackCard key={b._id} booking={b} />
                ))}
              </div>
            </details>
          ) : null}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <KeyRound className="size-3.5" />
        OTPs are sent to the farmer only — ask them to read it out or hand it over in person.
      </p>
    </div>
  );
}
