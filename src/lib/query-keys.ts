import type { EquipmentFilters } from "@/lib/api/equipment";

export const qk = {
  authMe: ["auth", "me"] as const,

  equipmentList: (filters: EquipmentFilters) => ["equipment", "list", filters] as const,
  equipmentDetail: (id: string) => ["equipment", "detail", id] as const,
  equipmentNearby: (params: { latitude: number; longitude: number; radius?: number }) =>
    ["equipment", "nearby", params] as const,
  myEquipment: (rentalerId: string) => ["equipment", "mine", rentalerId] as const,

  myBookings: ["bookings", "mine"] as const,
  rentalerBookings: ["bookings", "rentaler"] as const,
  bookingDetail: (id: string) => ["bookings", "detail", id] as const,

  paymentHistory: ["payments", "history"] as const,
  paymentDetail: (id: string) => ["payments", "detail", id] as const,

  equipmentReviews: (equipmentId: string) => ["reviews", "equipment", equipmentId] as const,

  notifications: ["notifications", "list"] as const,

  wishlist: ["wishlist", "mine"] as const,
  wishlistCheck: (equipmentId: string) => ["wishlist", "check", equipmentId] as const,

  availability: (equipmentId: string) => ["availability", equipmentId] as const,

  categories: ["categories"] as const,

  farmerDashboard: ["dashboard", "farmer"] as const,
  rentalerDashboard: ["dashboard", "rentaler"] as const,
  adminDashboard: ["admin", "dashboard"] as const,
  adminAnalytics: ["admin", "analytics"] as const,

  adminUsers: (params: unknown) => ["admin", "users", params] as const,
  adminPendingRentalers: ["admin", "rentalers", "pending"] as const,
  adminApprovedRentalers: ["admin", "rentalers", "approved"] as const,
  adminPendingEquipment: ["admin", "equipment", "pending"] as const,
  adminApprovedEquipment: ["admin", "equipment", "approved"] as const,
  adminAllEquipment: ["admin", "equipment", "all"] as const,
  adminBookings: (params: unknown) => ["admin", "bookings", params] as const,
  adminPayments: (params: unknown) => ["admin", "payments", params] as const,
  adminReviews: (params: unknown) => ["admin", "reviews", params] as const,
};
