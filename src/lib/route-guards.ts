import { redirect } from "@tanstack/react-router";
import { authStore } from "@/lib/auth-store";
import { resetGoogleTranslate } from "@/lib/google-translate";
import type { AppUser } from "@/types/models";

type Location = { href: string };

export function requireAuth(location: Location): AppUser {
  const { user, accessToken } = authStore.getState();
  if (!accessToken || !user) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
  resetGoogleTranslate();
  return user;
}

export function requireFarmer(location: Location): AppUser {
  const user = requireAuth(location);
  if (!user.is_farmer) {
    throw redirect({ to: "/" });
  }
  return user;
}

export function requireApprovedRentaler(location: Location): AppUser {
  const user = requireAuth(location);
  if (!user.is_rentaler || user.rentaler_status !== "approved") {
    throw redirect({ to: "/farmer/profile", search: { upgrade: true } });
  }
  return user;
}

export function requireAdmin(location: Location): AppUser {
  const user = requireAuth(location);
  if (!user.isAdmin) {
    throw redirect({ to: "/" });
  }
  return user;
}
