import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onError: (err) => toast.error(errorMessage(err, "Could not log in.")),
  });
}

export function useRegister() {
  const { register } = useAuth();
  return useMutation({
    mutationFn: (input: { fullName: string; email: string; phone: string; password: string; confirmPassword: string }) =>
      register(input),
    onError: (err) => toast.error(errorMessage(err, "Could not create your account.")),
  });
}

export function useLogout() {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: () => logout(),
  });
}

export function useUpgradeToRentaler() {
  const { refetchMe } = useAuth();
  return useMutation({
    mutationFn: (input: authApi.KycInput) => authApi.upgradeToRentaler(input),
    onSuccess: async () => {
      await refetchMe();
      toast.success("Rentaler application submitted. We'll notify you once it's reviewed.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not submit your application.")),
  });
}

export function useUpdateProfile() {
  const { refetchMe } = useAuth();
  return useMutation({
    mutationFn: (input: authApi.UpdateProfileInput) => authApi.updateMe(input),
    onSuccess: async () => {
      await refetchMe();
      toast.success("Profile updated.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not update your profile.")),
  });
}

export function useUploadProfileImage() {
  const { refetchMe } = useAuth();
  return useMutation({
    mutationFn: (file: File) => authApi.uploadProfileImage(file),
    onSuccess: async () => {
      await refetchMe();
      toast.success("Profile photo updated.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not upload your photo.")),
  });
}
