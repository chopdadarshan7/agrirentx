import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api-client";
import * as bookingsApi from "@/lib/api/bookings";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function invalidateBookings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["bookings"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useMyBookings() {
  return useQuery({ queryKey: qk.myBookings, queryFn: bookingsApi.listMyBookings });
}

export function useRentalerBookings() {
  return useQuery({ queryKey: qk.rentalerBookings, queryFn: bookingsApi.listRentalerBookings });
}

export function useBookingDetail(id: string | undefined) {
  return useQuery({
    queryKey: qk.bookingDetail(id ?? ""),
    queryFn: () => bookingsApi.getBooking(id as string),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => invalidateBookings(queryClient),
    onError: (err) => toast.error(errorMessage(err, "Could not create the booking.")),
  });
}

export function useApproveBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.approveBooking(id),
    onSuccess: () => {
      invalidateBookings(queryClient);
      toast.success("Booking approved.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not approve the booking.")),
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingsApi.rejectBooking(id, reason),
    onSuccess: () => {
      invalidateBookings(queryClient);
      toast.success("Booking rejected.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not reject the booking.")),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingsApi.cancelBooking(id, reason),
    onSuccess: () => {
      invalidateBookings(queryClient);
      toast.success("Booking cancelled.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not cancel the booking.")),
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.completeBooking(id),
    onSuccess: () => {
      invalidateBookings(queryClient);
      toast.success("Booking marked complete.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not complete the booking.")),
  });
}

export function useGenerateDeliveryOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.generateDeliveryOtp(id),
    onSuccess: () => {
      invalidateBookings(queryClient);
      toast.success("Delivery OTP sent to the farmer.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not send the delivery OTP.")),
  });
}

export function useVerifyDeliveryOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => bookingsApi.verifyDeliveryOtp(id, otp),
    onSuccess: () => {
      invalidateBookings(queryClient);
      toast.success("Delivery confirmed.");
    },
    onError: (err) => toast.error(errorMessage(err, "Incorrect OTP.")),
  });
}

export function useGenerateReturnOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.generateReturnOtp(id),
    onSuccess: () => {
      invalidateBookings(queryClient);
      toast.success("Return OTP sent to the farmer.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not send the return OTP.")),
  });
}

export function useVerifyReturnOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => bookingsApi.verifyReturnOtp(id, otp),
    onSuccess: () => {
      invalidateBookings(queryClient);
      toast.success("Return confirmed.");
    },
    onError: (err) => toast.error(errorMessage(err, "Incorrect OTP.")),
  });
}
