import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { users as seed } from "@/lib/data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — AgriRentX Admin" },
      { name: "description", content: "Search accounts, review roles and block abusive users." },
      { property: "og:title", content: "Users — AgriRentX Admin" },
      { property: "og:description", content: "Manage farmer and rentaler accounts." },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [rows, setRows] = useState(seed);
  const [q, setQ] = useState("");
  const list = rows.filter((u) =>
    `${u.name} ${u.email} ${u.district}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Blocking an account signs the user out of every device." />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, email or district"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">District</th>
              <th className="px-5 py-3 font-medium">Roles</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{u.district}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.isFarmer ? <StatusBadge status="active" label="Farmer" /> : null}
                    {u.isRentaler ? <StatusBadge status="approved" label="Rentaler" /> : null}
                    {u.isAdmin ? <StatusBadge status="confirmed" label="Admin" /> : null}
                    {u.blocked ? <StatusBadge status="rejected" label="Blocked" /> : null}
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{u.joined}</td>
                <td className="px-5 py-3 text-right">
                  <Button
                    size="sm"
                    variant={u.blocked ? "default" : "outline"}
                    onClick={() =>
                      setRows((l) => l.map((x) => (x.id === u.id ? { ...x, blocked: !x.blocked } : x)))
                    }
                  >
                    {u.blocked ? "Unblock" : "Block"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
