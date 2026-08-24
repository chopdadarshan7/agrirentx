import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader, SectionCard } from "@/components/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useBroadcastNotification } from "@/hooks/queries/use-admin";
import { broadcastSchema, type BroadcastFormValues } from "@/lib/validation/broadcast";

export const Route = createFileRoute("/admin/broadcast")({
  head: () => ({
    meta: [
      { title: "Broadcast — AgriRentX Admin" },
      { name: "description", content: "Send a notification to all users, farmers, or rentalers." },
      { property: "og:title", content: "Broadcast — AgriRentX Admin" },
      { property: "og:description", content: "Reach every AgriRentX user with a platform-wide notice." },
    ],
  }),
  component: AdminBroadcastPage,
});

function AdminBroadcastPage() {
  const broadcast = useBroadcastNotification();
  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: "", message: "", audience: "all" },
  });

  const onSubmit = (values: BroadcastFormValues) => {
    broadcast.mutate(values, { onSuccess: () => form.reset() });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Broadcast" description="Send a notification to a segment of AgriRentX users." />

      <SectionCard title="New broadcast">
        <Form {...form}>
          <form className="max-w-xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Scheduled maintenance tonight" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="What do you want to tell them?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audience</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All users</SelectItem>
                      <SelectItem value="farmers">Farmers</SelectItem>
                      <SelectItem value="rentalers">Rentalers</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={broadcast.isPending}>
              <Megaphone className="size-4" />
              {broadcast.isPending ? "Sending…" : "Send broadcast"}
            </Button>
          </form>
        </Form>
      </SectionCard>
    </div>
  );
}
