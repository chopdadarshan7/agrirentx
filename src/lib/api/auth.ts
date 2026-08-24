import { apiFetch } from "@/lib/api-client";
import type { AppUser } from "@/types/models";

type AuthPayload = { user: AppUser; accessToken: string; refreshToken: string };

export function login(email: string, password: string) {
  return apiFetch<{ success: true; message: string } & AuthPayload>("/auth/login", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
}

export function register(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}) {
  return apiFetch<{ success: true; message: string } & AuthPayload>("/auth/register", {
    method: "POST",
    body: input,
    skipAuth: true,
  });
}

export async function getMe() {
  const res = await apiFetch<{ success: true; user: AppUser }>("/auth/me");
  return res.user;
}

export function logout() {
  return apiFetch<{ success: true; message: string }>("/auth/logout", { method: "POST" });
}

export type KycInput = {
  account_holder: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
};

export async function upgradeToRentaler(input: KycInput) {
  const res = await apiFetch<{ success: true; message: string; user: Partial<AppUser> }>(
    "/auth/upgrade-rentaler",
    { method: "PUT", body: input },
  );
  return res.user;
}

export type UpdateProfileInput = {
  fullName?: string | undefined;
  phone?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  pincode?: string | undefined;
};

export async function updateMe(input: UpdateProfileInput) {
  const res = await apiFetch<{ success: true; message: string; user: AppUser }>("/auth/me", {
    method: "PUT",
    body: input,
  });
  return res.user;
}

export async function uploadProfileImage(file: File) {
  const fd = new FormData();
  fd.append("profileImage", file);
  const res = await apiFetch<{ success: true; message: string; data: { avatar: string } }>(
    "/users/profile-image",
    { method: "PUT", body: fd },
  );
  return res.data;
}
