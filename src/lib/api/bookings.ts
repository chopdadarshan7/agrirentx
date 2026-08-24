import { apiFetch } from "@/lib/api-client";
import type { Booking } from "@/types/models";

type BookingResponse = { success: true; message?: string; data: Booking };
type BookingListResponse = { success: true; count: number; data: Booking[] };

export async function createBooking(input: {
  equipment_id: string;
  start_date: string;
  end_date: string;
  delivery_required: boolean;
  delivery_address?: string | undefined;
  contact_phone: string;
}) {
  const res = await apiFetch<BookingResponse>("/bookings", { method: "POST", body: input });
  return res.data;
}

export async function listMyBookings() {
  const res = await apiFetch<BookingListResponse>("/bookings/my-bookings");
  return res.data;
}

export async function listRentalerBookings() {
  const res = await apiFetch<BookingListResponse>("/bookings/rentaler-bookings");
  return res.data;
}

export async function getBooking(id: string) {
  const res = await apiFetch<BookingResponse>(`/bookings/${id}`);
  return res.data;
}

export async function approveBooking(id: string) {
  const res = await apiFetch<BookingResponse>(`/bookings/${id}/approve`, { method: "PUT" });
  return res.data;
}

export async function rejectBooking(id: string, reason?: string) {
  const res = await apiFetch<BookingResponse>(`/bookings/${id}/reject`, {
    method: "PUT",
    body: reason ? { reason } : undefined,
  });
  return res.data;
}

export async function cancelBooking(id: string, reason?: string) {
  const res = await apiFetch<BookingResponse>(`/bookings/${id}/cancel`, {
    method: "PUT",
    body: reason ? { reason } : undefined,
  });
  return res.data;
}

export async function completeBooking(id: string) {
  const res = await apiFetch<BookingResponse>(`/bookings/${id}/complete`, { method: "PUT" });
  return res.data;
}

export async function generateDeliveryOtp(id: string) {
  return apiFetch<{ success: true; message: string }>(`/bookings/${id}/delivery-otp/generate`, { method: "PUT" });
}

export async function verifyDeliveryOtp(id: string, otp: string) {
  const res = await apiFetch<BookingResponse>(`/bookings/${id}/delivery-otp/verify`, {
    method: "PUT",
    body: { otp },
  });
  return res.data;
}

export async function generateReturnOtp(id: string) {
  return apiFetch<{ success: true; message: string }>(`/bookings/${id}/return-otp/generate`, { method: "PUT" });
}

export async function verifyReturnOtp(id: string, otp: string) {
  const res = await apiFetch<BookingResponse>(`/bookings/${id}/return-otp/verify`, {
    method: "PUT",
    body: { otp },
  });
  return res.data;
}
