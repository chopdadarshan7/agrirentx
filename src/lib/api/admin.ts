import { apiFetch } from "@/lib/api-client";
import { toQuery } from "@/lib/utils";
import type { AppUser, Booking, Equipment, Payment, Review } from "@/types/models";

type Paged<T, Key extends string> = { success: true; message: string; data: Record<Key, T[]> & {
  pagination: { total: number; page: number; limit: number; totalPages: number };
} };

// ---------- Users ----------
export async function listAdminUsers(params: {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  role?: string | undefined;
}) {
  const res = await apiFetch<Paged<AppUser, "users">>(`/admin/users${toQuery(params)}`);
  return { items: res.data.users, pagination: res.data.pagination };
}

export async function blockUser(id: string) {
  const res = await apiFetch<{ success: true; message: string; data: AppUser }>(`/admin/users/${id}/block`, {
    method: "PUT",
  });
  return res.data;
}

export async function unblockUser(id: string) {
  const res = await apiFetch<{ success: true; message: string; data: AppUser }>(`/admin/users/${id}/unblock`, {
    method: "PUT",
  });
  return res.data;
}

export async function deleteAdminUser(id: string) {
  return apiFetch<{ success: true; message: string }>(`/admin/users/${id}`, { method: "DELETE" });
}

// ---------- Rentalers ----------
export async function listPendingRentalers() {
  const res = await apiFetch<{ success: true; message: string; data: AppUser[] }>("/admin/rentalers/pending");
  return res.data;
}

export async function listApprovedRentalers() {
  const res = await apiFetch<{ success: true; message: string; data: AppUser[] }>("/admin/rentalers/approved");
  return res.data;
}

export async function approveRentaler(id: string) {
  const res = await apiFetch<{ success: true; message: string; data: AppUser }>(
    `/admin/rentalers/${id}/approve`,
    { method: "PUT" },
  );
  return res.data;
}

export async function rejectRentaler(id: string, reason?: string) {
  const res = await apiFetch<{ success: true; message: string; data: AppUser }>(
    `/admin/rentalers/${id}/reject`,
    { method: "PUT", body: reason ? { reason } : undefined },
  );
  return res.data;
}

// ---------- Equipment moderation ----------
export async function listPendingEquipment() {
  const res = await apiFetch<{ success: true; message: string; data: Equipment[] }>("/admin/equipments/pending");
  return res.data;
}

export async function listApprovedEquipment() {
  const res = await apiFetch<{ success: true; message: string; data: Equipment[] }>("/admin/equipments/approved");
  return res.data;
}

export async function listAllAdminEquipment() {
  const res = await apiFetch<{ success: true; message: string; data: Equipment[] }>("/admin/equipments");
  return res.data;
}

export async function approveEquipmentAdmin(id: string) {
  const res = await apiFetch<{ success: true; message: string; data: Equipment }>(
    `/admin/equipments/${id}/approve`,
    { method: "PUT" },
  );
  return res.data;
}

export async function rejectEquipmentAdmin(id: string, reason?: string) {
  const res = await apiFetch<{ success: true; message: string; data: Equipment }>(
    `/admin/equipments/${id}/reject`,
    { method: "PUT", body: reason ? { reason } : undefined },
  );
  return res.data;
}

// ---------- Bookings ----------
export async function listAdminBookings(params: { page?: number; limit?: number; status?: string }) {
  const res = await apiFetch<Paged<Booking, "bookings">>(`/admin/bookings${toQuery(params)}`);
  return { items: res.data.bookings, pagination: res.data.pagination };
}

// ---------- Payments ----------
export async function listAdminPayments(params: { page?: number; limit?: number; payment_status?: string }) {
  const res = await apiFetch<Paged<Payment, "payments">>(`/admin/payments${toQuery(params)}`);
  return { items: res.data.payments, pagination: res.data.pagination };
}

export async function refundAdminPayment(id: string, reason?: string) {
  const res = await apiFetch<{ success: true; message: string; data: Payment }>(`/admin/payments/${id}/refund`, {
    method: "PUT",
    body: reason ? { reason } : undefined,
  });
  return res.data;
}

// ---------- Reviews ----------
export async function listAdminReviews(params: { page?: number; limit?: number; rating?: number }) {
  const res = await apiFetch<Paged<Review, "reviews">>(`/admin/reviews${toQuery(params)}`);
  return { items: res.data.reviews, pagination: res.data.pagination };
}

export async function hideReview(id: string) {
  const res = await apiFetch<{ success: true; message: string; data: Review }>(`/admin/reviews/${id}/hide`, {
    method: "PUT",
  });
  return res.data;
}

export async function restoreReview(id: string) {
  const res = await apiFetch<{ success: true; message: string; data: Review }>(`/admin/reviews/${id}/restore`, {
    method: "PUT",
  });
  return res.data;
}

export async function deleteAdminReview(id: string) {
  return apiFetch<{ success: true; message: string }>(`/admin/reviews/${id}`, { method: "DELETE" });
}

// ---------- Notifications ----------
export type BroadcastInput = {
  title: string;
  message: string;
  audience: "all" | "farmers" | "rentalers";
};

export async function broadcastNotification(input: BroadcastInput) {
  const res = await apiFetch<{ success: true; message: string; data: { totalSent: number } }>(
    "/admin/notifications/broadcast",
    { method: "POST", body: input },
  );
  return res.data;
}
