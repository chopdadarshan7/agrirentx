import { createFileRoute, Link } from "@tanstack/react-router";
import { Tractor } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/farmer/profile")({
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

// Account state for the signed-in farmer (mock).
const profile = {
  name: "Aarti Deshmukh",
  email: "aarti@example.com",
  phone: "+91 98220 11223",
  district: "Nashik",
  state: "Maharashtra",
  isRentaler: false,
  rentalerStatus: null as "pending" | "approved" | "rejected" | null,
};

function FarmerProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account details and rentaler status." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <SectionCard>
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-accent text-lg text-accent-foreground">AD</AvatarFallback>
            </Avatar>
            <p className="mt-3 font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">
              {profile.district}, {profile.state}
            </p>
            <div className="mt-3 flex gap-2">
              <StatusBadge status="active" label="Farmer" />
              {profile.isRentaler ? <StatusBadge status="approved" label="Rentaler" /> : null}
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              Change photo
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Account details">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <Label htmlFor="pname">Full name</Label>
              <Input id="pname" defaultValue={profile.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pemail">Email</Label>
              <Input id="pemail" type="email" defaultValue={profile.email} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pphone">Mobile</Label>
              <Input id="pphone" defaultValue={profile.phone} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pdistrict">District</Label>
              <Input id="pdistrict" defaultValue={profile.district} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Renting out equipment">
        {profile.rentalerStatus === "pending" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Your rentaler application is under review</p>
              <p className="text-sm text-muted-foreground">
                Our team verifies ownership documents within two working days.
              </p>
            </div>
            <StatusBadge status="pending" label="Verification pending" />
          </div>
        ) : profile.isRentaler ? (
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
                Earn from machines that sit idle between seasons. You'll need an ownership document
                and clear photos to get verified.
              </p>
            </div>
            <Button asChild>
              <Link to="/rentaler/equipment/new">
                <Tractor className="size-4" />
                Rent your equipment
              </Link>
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
