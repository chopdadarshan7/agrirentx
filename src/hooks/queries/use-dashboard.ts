import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import * as dashboardApi from "@/lib/api/dashboard";

export function useFarmerDashboard() {
  return useQuery({ queryKey: qk.farmerDashboard, queryFn: dashboardApi.getFarmerDashboard });
}

export function useRentalerDashboard() {
  return useQuery({ queryKey: qk.rentalerDashboard, queryFn: dashboardApi.getRentalerDashboard });
}

export function useAdminDashboard() {
  return useQuery({ queryKey: qk.adminDashboard, queryFn: dashboardApi.getAdminDashboard });
}

export function useAdminAnalytics() {
  return useQuery({ queryKey: qk.adminAnalytics, queryFn: dashboardApi.getAdminAnalyticsDashboard });
}
