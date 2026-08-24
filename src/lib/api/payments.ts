import { apiFetch } from "@/lib/api-client";
import type { Payment } from "@/types/models";

type RazorpayOrder = { id: string; amount?: number; currency?: string };

export async function createOrder(bookingId: string) {
  const res = await apiFetch<{ success: true; message: string; data: { payment: Payment; order: RazorpayOrder } }>(
    "/payments/create-order",
    { method: "POST", body: { booking_id: bookingId } },
  );
  return res.data;
}

export async function verifyPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const res = await apiFetch<{ success: true; message: string; data: Payment }>("/payments/verify", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function listPaymentHistory() {
  const res = await apiFetch<{ success: true; count: number; data: Payment[] }>("/payments/history");
  return res.data;
}

export async function getPayment(id: string) {
  const res = await apiFetch<{ success: true; data: Payment }>(`/payments/${id}`);
  return res.data;
}

export async function retryPayment(id: string) {
  const res = await apiFetch<{ success: true; message: string; data: { payment: Payment; order: RazorpayOrder } }>(
    `/payments/retry/${id}`,
    { method: "POST" },
  );
  return res.data;
}
