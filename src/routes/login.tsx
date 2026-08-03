import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
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

function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <PublicShell>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <div className="surface-card p-7 shadow-md">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in to manage bookings, listings and payments.
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError("Those credentials didn't match an account. Check your email and password.");
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>

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
