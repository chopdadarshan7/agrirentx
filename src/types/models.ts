/**
 * TypeScript interfaces mirroring the real agrirentx-backend Mongoose models
 * exactly (field names, enums). Keep in sync with the backend — these are
 * the contract between frontend and API, not aspirational types.
 */

export type RentalerStatus = "none" | "pending" | "approved" | "rejected";

export interface AppUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_farmer: boolean;
  is_rentaler: boolean;
  rentaler_status: RentalerStatus;
  isAdmin: boolean;
  isBlocked: boolean;
  role: "admin" | "rentaler" | "farmer";
  lastLogin?: string;
  createdAt?: string;
}

export type EquipmentStatus = "available" | "rented" | "maintenance" | "inactive";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface EquipmentLocation {
  address: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
}

export interface EquipmentCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface EquipmentRentalerRef {
  _id: string;
  fullName: string;
  phone?: string;
  avatar?: string;
}

export interface Equipment {
  _id: string;
  rentaler_id: string | EquipmentRentalerRef;
  category_id: string | EquipmentCategoryRef;
  title: string;
  description: string;
  specifications?: Record<string, string>;
  price_per_day: number;
  security_deposit: number;
  location: EquipmentLocation;
  images: string[];
  ownership_document_url?: string;
  status: EquipmentStatus;
  approval_status: ApprovalStatus;
  average_rating: number;
  total_reviews: number;
  is_deleted: boolean;
  createdAt?: string;
}

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface BookingEquipmentRef {
  _id: string;
  title: string;
  images: string[];
  price_per_day: number;
}

export interface BookingPartyRef {
  _id: string;
  fullName: string;
  phone?: string;
}

export interface Booking {
  _id: string;
  farmer_id: string | BookingPartyRef;
  rentaler_id: string | BookingPartyRef;
  equipment_id: string | BookingEquipmentRef;
  start_date: string;
  end_date: string;
  total_days: number;
  base_amount: number;
  deposit_amount: number;
  platform_fee: number;
  total_amount: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  delivery_required?: boolean;
  delivery_address?: string;
  contact_phone?: string;
  logistics_status?: "awaiting_delivery" | "delivered" | "returned";
  /** Only present when the current viewer is the farmer on this booking. */
  delivery_otp?: string;
  delivery_otp_generated_at?: string;
  delivered_at?: string;
  /** Only present when the current viewer is the farmer on this booking. */
  return_otp?: string;
  return_otp_generated_at?: string;
  returned_at?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  completed_at?: string;
  can_cancel?: boolean;
  createdAt: string;
}

export type RefundStatus = "none" | "pending" | "processed" | "failed";

export type PayoutStatus = "pending" | "processing" | "completed";

export interface Payment {
  _id: string;
  booking_id: string | Booking;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: PaymentStatus;
  refund_id?: string;
  refund_status: RefundStatus;
  commission_amount?: number;
  payout_amount?: number;
  payout_status?: PayoutStatus;
  paid_at?: string;
  refunded_at?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  booking_id: string;
  equipment_id: string;
  farmer_id: string | BookingPartyRef;
  rentaler_id: string;
  rating: number;
  review: string;
  isVisible: boolean;
  createdAt: string;
}

export type NotificationType = "booking" | "payment" | "kyc" | "equipment" | "review" | "system";

export interface AppNotification {
  _id: string;
  receiver_id: string;
  sender_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  spec_template: { label: string; key: string; type: string; options?: string[]; required?: boolean }[];
  isActive: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
