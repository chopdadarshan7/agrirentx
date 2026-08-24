import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Loader2, Tractor } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader, SectionCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveUploadUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useUpgradeToRentaler, useUpdateProfile, useUploadProfileImage } from "@/hooks/queries/use-auth";
import { kycSchema, type KycFormValues } from "@/lib/validation/kyc";
import { profileSchema, type ProfileFormValues } from "@/lib/validation/profile";
import type { AppUser } from "@/types/models";

type ProfileSearch = { upgrade?: boolean | undefined };

export const Route = createFileRoute("/farmer/profile")({
  validateSearch: (search: Record<string, unknown>): ProfileSearch => ({
    ...(search["upgrade"] === true || search["upgrade"] === "true" ? { upgrade: true } : {}),
  }),
  head: () => ({
    meta: [
      { title: "My Profile — AgriRentX" },
      { name: "description", content: "Update your contact details and start renting out your own equipment." },
      { property: "og:title", content: "My Profile — AgriRentX" },
      { property: "og:description", content: "Manage your AgriRentX account details." },
    ],
  }),
  component: FarmerProfilePage,
});

function KycDialogContent({ onDone }: { onDone: () => void }) {
  const upgrade = useUpgradeToRentaler();
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: { account_holder: "", account_number: "", ifsc_code: "", bank_name: "" },
  });

  const onSubmit = async (values: KycFormValues) => {
    await upgrade.mutateAsync(values);
    onDone();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Rent your equipment</DialogTitle>
        <DialogDescription>
          Submit your bank details so we can verify and approve your rentaler account. An admin
          reviews every application before you can list equipment.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="account_holder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account holder name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ifsc_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. HDFC0001234" className="uppercase" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={upgrade.isPending}>
              {upgrade.isPending ? "Submitting…" : "Submit application"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

function AccountDetailsForm({ user }: { user: AppUser }) {
  const updateProfile = useUpdateProfile();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone,
      address: user.address ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      pincode: user.pincode ?? "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values);
  };

  return (
    <Form {...form}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-1.5">
          <Label htmlFor="pemail">Email</Label>
          <Input id="pemail" type="email" defaultValue={user.email} disabled />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pincode</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ProfileAvatar({ user, initials }: { user: AppUser; initials: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadProfileImage();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage.mutate(file);
    e.target.value = "";
  };

  return (
    <div className="relative">
      <Avatar className="size-20">
        <AvatarImage src={resolveUploadUrl(user.avatar)} alt={user.fullName} />
        <AvatarFallback className="bg-accent text-lg text-accent-foreground">{initials}</AvatarFallback>
      </Avatar>
      <button
        type="button"
        aria-label="Change profile photo"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadImage.isPending}
        className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
      >
        {uploadImage.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Camera className="size-3.5" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function FarmerProfilePage() {
  const { user } = useAuth();
  const search = useSearch({ from: "/farmer/profile" });
  const [kycOpen, setKycOpen] = useState(!!search.upgrade);

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account details and rentaler status." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <SectionCard>
          <div className="flex flex-col items-center text-center">
            <ProfileAvatar user={user} initials={initials} />
            <p className="mt-3 font-semibold">{user.fullName}</p>
            {user.city || user.state ? (
              <p className="text-sm text-muted-foreground">
                {[user.city, user.state].filter(Boolean).join(", ")}
              </p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <StatusBadge status="active" label="Farmer" />
              {user.is_rentaler && user.rentaler_status === "approved" ? (
                <StatusBadge status="approved" label="Rentaler" />
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Account details">
          <AccountDetailsForm user={user} />
        </SectionCard>
      </div>

      <SectionCard title="Renting out equipment">
        {user.rentaler_status === "pending" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Your rentaler application is under review</p>
              <p className="text-sm text-muted-foreground">
                Our team verifies your details before approving new rentalers.
              </p>
            </div>
            <StatusBadge status="pending" label="Verification pending" />
          </div>
        ) : user.rentaler_status === "rejected" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Your rentaler application was rejected</p>
              <p className="text-sm text-muted-foreground">Contact support if you'd like to reapply.</p>
            </div>
            <StatusBadge status="rejected" />
          </div>
        ) : user.is_rentaler && user.rentaler_status === "approved" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              You're an approved rentaler. Manage your listings from the rentaler workspace.
            </p>
            <Button asChild>
              <Link to="/rentaler">Open rentaler workspace</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-lg">
              <p className="text-sm font-medium">Rent your equipment</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Earn from machines that sit idle between seasons. Submit your bank details to get
                started — an admin approves every application.
              </p>
            </div>
            <Dialog open={kycOpen} onOpenChange={setKycOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Tractor className="size-4" />
                  Rent your equipment
                </Button>
              </DialogTrigger>
              <KycDialogContent onDone={() => setKycOpen(false)} />
            </Dialog>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
