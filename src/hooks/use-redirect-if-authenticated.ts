import { useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

function landingPathFor(user: { isAdmin: boolean; is_rentaler: boolean; rentaler_status: string }) {
  if (user.isAdmin) return "/admin";
  if (user.is_rentaler && user.rentaler_status === "approved") return "/rentaler";
  return "/farmer";
}

/** Client-only redirect for already-authenticated users hitting /login or /register. */
export function useRedirectIfAuthenticated() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    navigate({ to: search.redirect ?? landingPathFor(user) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
}
