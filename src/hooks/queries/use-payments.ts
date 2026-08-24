import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api-client";
import * as paymentsApi from "@/lib/api/payments";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function usePaymentHistory() {
  return useQuery({ queryKey: qk.paymentHistory, queryFn: paymentsApi.listPaymentHistory });
}

export function usePaymentDetail(id: string | undefined) {
  return useQuery({
    queryKey: qk.paymentDetail(id ?? ""),
    queryFn: () => paymentsApi.getPayment(id as string),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (bookingId: string) => paymentsApi.createOrder(bookingId),
    onError: (err) => toast.error(errorMessage(err, "Could not start the payment.")),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err) => toast.error(errorMessage(err, "Payment verification failed.")),
  });
}

export function useRetryPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.retryPayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
    onError: (err) => toast.error(errorMessage(err, "Could not retry the payment.")),
  });
}
