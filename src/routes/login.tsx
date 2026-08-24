import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicShell } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useLogin } from "@/hooks/queries/use-auth";
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect-if-authenticated";
import { ApiError } from "@/lib/api-client";

type LoginSearch = { redirect?: string | undefined };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log in — AgriRentX" },
      { name: "description", content: "Log in to manage your AgriRentX bookings and listings." },
      { property: "og:title", content: "Log in — AgriRentX" },
      { property: "og:description", content: "Access your AgriRentX farmer or rentaler workspace." },
    ],
  }),
  component: LoginPage,
});

function landingPathFor(user: { isAdmin: boolean; is_rentaler: boolean; rentaler_status: string }) {
  if (user.isAdmin) return "/admin";
  if (user.is_rentaler && user.rentaler_status === "approved") return "/rentaler";
  return "/farmer";
}

function LoginPage() {
  useRedirectIfAuthenticated();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await login.mutateAsync(values);
      navigate({ to: search.redirect ?? landingPathFor(user) });
    } catch {
      // error surfaced below via login.error
    }
  };

  const errorMessage = login.error instanceof ApiError ? login.error.message : login.error ? "Could not log in." : null;

  return (
    <PublicShell>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <div className="surface-card p-7 shadow-md">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in to manage bookings, listings and payments.
          </p>

          {errorMessage ? (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {errorMessage}
            </p>
          ) : null}

          <Form {...form}>
            <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? "Logging in…" : "Log in"}
              </Button>
            </form>
          </Form>

          <p className="mt-5 text-sm text-muted-foreground">
            New to AgriRentX?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </PublicShell>
  );
}
