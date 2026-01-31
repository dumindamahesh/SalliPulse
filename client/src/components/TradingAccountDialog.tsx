import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTradingAccountSchema, type InsertTradingAccount } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

interface TradingAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradingAccountDialog({ open, onOpenChange }: TradingAccountDialogProps) {
  const { toast } = useToast();
  const form = useForm<InsertTradingAccount>({
    resolver: zodResolver(insertTradingAccountSchema),
    defaultValues: {
      brokerName: "",
      accountType: "real",
      fundedCompanyName: "",
      accountCapacity: "",
      status: "active",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTradingAccount) => {
      // Add a client-side ID since the schema might expect it if MemStorage is used or if the server expects it
      const payload = { ...data, id: nanoid() };
      await apiRequest("POST", "/api/trading-accounts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      toast({ title: "Success", description: "Trading account added successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add trading account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTradingAccount) => {
    mutation.mutate(data);
  };

  const accountType = form.watch("accountType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Trading Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brokerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Broker Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. IC Markets" {...field} data-testid="input-broker-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-account-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="real">Real</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {accountType === "funded" && (
              <FormField
                control={form.control}
                name="fundedCompanyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funded Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. FTMO" {...field} value={field.value ?? ""} data-testid="input-funded-company" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="accountCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Capacity (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 10000" {...field} data-testid="input-capacity" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional notes" {...field} value={field.value ?? ""} data-testid="input-notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-account">
                {mutation.isPending ? "Saving..." : "Save Account"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
