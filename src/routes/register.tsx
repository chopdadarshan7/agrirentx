import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — AgriRentX" },
      {
        name: "description",
        content: "Sign up in a minute to rent farm equipment or list your own machines.",
      },
      { property: "og:title", content: "Create your account — AgriRentX" },
      {
        property: "og:description",
        content: "Join AgriRentX to book equipment or earn from idle machines.",
      },
    ],
  }),
  component: RegisterPage,
});

type Fields = { name: string; email: string; phone: string; password: string };

function RegisterPage() {
  const [values, setValues] = useState<Fields>({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Partial<Fields>>({});

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Fields> = {};
    if (values.name.trim().length < 3) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (!/^[0-9+\s-]{10,15}$/.test(values.phone)) next.phone = "Enter a 10-digit mobile number.";
    if (values.password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
  };

  const field = (
    key: keyof Fields,
    label: string,
    type: string,
    placeholder: string,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        placeholder={placeholder}
        value={values[key]}
        onChange={set(key)}
        aria-invalid={Boolean(errors[key])}
        className={cn(errors[key] && "border-destructive focus-visible:ring-destructive/30")}
      />
      {errors[key] ? <p className="text-xs text-destructive">{errors[key]}</p> : null}
    </div>
  );

  return (
    <PublicShell>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <div className="surface-card p-7 shadow-md">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One account covers renting and listing — you can start renting out equipment later from
            your profile.
          </p>

          <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
            {field("name", "Full name", "text", "Aarti Deshmukh")}
            {field("email", "Email", "email", "you@example.com")}
            {field("phone", "Mobile number", "tel", "+91 98220 11223")}
            {field("password", "Password", "password", "At least 8 characters")}
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </PublicShell>
  );
}
