import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api-client";
import * as adminApi from "@/lib/api/admin";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

// ---------- Users ----------
export function useAdminUsers(params: {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  role?: string | undefined;
}) {
  return useQuery({ queryKey: qk.adminUsers(params), queryFn: () => adminApi.listAdminUsers(params) });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User blocked.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not block the user.")),
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User unblocked.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not unblock the user.")),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User deleted.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not delete the user.")),
  });
}

// ---------- Rentalers ----------
export function useAdminPendingRentalers() {
  return useQuery({ queryKey: qk.adminPendingRentalers, queryFn: adminApi.listPendingRentalers });
}

export function useAdminApprovedRentalers() {
  return useQuery({ queryKey: qk.adminApprovedRentalers, queryFn: adminApi.listApprovedRentalers });
}

export function useApproveRentaler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveRentaler(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rentalers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Rentaler approved.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not approve the rentaler.")),
  });
}

export function useRejectRentaler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminApi.rejectRentaler(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rentalers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Rentaler application rejected.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not reject the rentaler.")),
  });
}

// ---------- Equipment moderation ----------
export function useAdminPendingEquipment() {
  return useQuery({ queryKey: qk.adminPendingEquipment, queryFn: adminApi.listPendingEquipment });
}

export function useAdminApprovedEquipment() {
  return useQuery({ queryKey: qk.adminApprovedEquipment, queryFn: adminApi.listApprovedEquipment });
}

export function useAdminAllEquipment() {
  return useQuery({ queryKey: qk.adminAllEquipment, queryFn: adminApi.listAllAdminEquipment });
}

export function useApproveEquipmentAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveEquipmentAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "equipment"] });
      toast.success("Listing approved.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not approve the listing.")),
  });
}

export function useRejectEquipmentAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminApi.rejectEquipmentAdmin(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "equipment"] });
      toast.success("Listing rejected.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not reject the listing.")),
  });
}

// ---------- Bookings ----------
export function useAdminBookings(params: { page?: number; limit?: number; status?: string }) {
  return useQuery({ queryKey: qk.adminBookings(params), queryFn: () => adminApi.listAdminBookings(params) });
}

// ---------- Payments ----------
export function useAdminPayments(params: { page?: number; limit?: number; payment_status?: string }) {
  return useQuery({ queryKey: qk.adminPayments(params), queryFn: () => adminApi.listAdminPayments(params) });
}

export function useAdminRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminApi.refundAdminPayment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      toast.success("Refund processed.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not process the refund.")),
  });
}

// ---------- Reviews ----------
export function useAdminReviews(params: { page?: number; limit?: number; rating?: number }) {
  return useQuery({ queryKey: qk.adminReviews(params), queryFn: () => adminApi.listAdminReviews(params) });
}

export function useHideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.hideReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review hidden.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not hide the review.")),
  });
}

export function useRestoreReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.restoreReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review restored.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not restore the review.")),
  });
}

export function useDeleteAdminReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review deleted.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not delete the review.")),
  });
}

// ---------- Notifications ----------
export function useBroadcastNotification() {
  return useMutation({
    mutationFn: (input: adminApi.BroadcastInput) => adminApi.broadcastNotification(input),
    onSuccess: (data) => toast.success(`Notification sent to ${data.totalSent} user${data.totalSent === 1 ? "" : "s"}.`),
    onError: (err) => toast.error(errorMessage(err, "Could not send the broadcast.")),
  });
}
