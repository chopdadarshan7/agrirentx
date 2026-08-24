import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminUsers, useBlockUser, useUnblockUser } from "@/hooks/queries/use-admin";

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
  const [queryInput, setQueryInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data } = useAdminUsers({ search: search || undefined, page, limit: 20 });
  const users = data?.items ?? [];
  const pagination = data?.pagination;
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(queryInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [queryInput]);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Blocking an account signs the user out of every device." />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, email or phone"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
        />
      </div>

      <div className="surface-card overflow-x-auto">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell>
                  <p className="font-medium">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {[u.city, u.state].filter(Boolean).join(", ") || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {u.is_farmer ? <StatusBadge status="active" label="Farmer" /> : null}
                    {u.is_rentaler ? <StatusBadge status={u.rentaler_status} label="Rentaler" /> : null}
                    {u.isAdmin ? <StatusBadge status="confirmed" label="Admin" /> : null}
                    {u.isBlocked ? <StatusBadge status="rejected" label="Blocked" /> : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={u.isBlocked ? "default" : "outline"}
                    onClick={() => (u.isBlocked ? unblockUser.mutate(u._id) : blockUser.mutate(u._id))}
                    disabled={blockUser.isPending || unblockUser.isPending}
                  >
                    {u.isBlocked ? "Unblock" : "Block"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
