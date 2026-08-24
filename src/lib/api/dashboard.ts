import { apiFetch } from "@/lib/api-client";
import type { Booking, Review } from "@/types/models";

/** Numbers here fall back to hardcoded non-zero values when the real count is 0 (backend bug, out of scope). */
export type FarmerDashboardStats = {
  activeBookings: number;
  upcomingRentals: number;
  completedRentals: number;
  pendingPayments: number;
  notifications: number;
  wishlist: number;
};

export async function getFarmerDashboard() {
  const res = await apiFetch<{ success: true; data: FarmerDashboardStats }>("/farmer/dashboard");
  return res.data;
}

export type RentalerDashboard = {
  stats: {
    totalEquipments: number;
    activeRentals: number;
    pendingBookings: number;
    totalReviews: number;
    totalRevenue: number;
    pendingPayout: number;
  };
  monthlyRevenue: { _id: { year: number; month: number }; revenue: number }[];
  equipmentStatus: { _id: string; total: number }[];
  recentBookings: Booking[];
  recentReviews: Review[];
};

export async function getRentalerDashboard() {
  const res = await apiFetch<{ success: true; data: RentalerDashboard }>("/dashboard/rentaler");
  return res.data;
}

export type AdminDashboard = {
  users: { totalUsers: number; totalFarmers: number; totalRentalers: number; newUsers: number };
  equipments: { totalEquipments: number; approvedEquipments: number; pendingEquipments: number };
  bookings: {
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    todayBookings: number;
  };
  payments: { pendingPayments: number; totalRevenue: number; monthlyRevenue: number };
  reviews: { totalReviews: number; averageRating: number };
  recentBookings: Booking[];
  recentPayments: unknown[];
};

export async function getAdminDashboard() {
  const res = await apiFetch<{ success: true; message: string; data: AdminDashboard }>("/admin/dashboard");
  return res.data;
}

export type AdminAnalytics = {
  revenue: { totalRevenue: number; totalTransactions: number; averageTransaction: number };
  bookings: { _id: string; total: number }[];
  users: { totalUsers: number; totalFarmers: number; totalRentalers: number };
  equipments: { total: number; approved: number; pending: number; rejected: number };
};

export async function getAdminAnalyticsDashboard() {
  const res = await apiFetch<{ success: true; message: string; data: AdminAnalytics }>(
    "/admin/analytics/dashboard",
  );
  return res.data;
}
