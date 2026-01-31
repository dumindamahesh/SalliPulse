import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Wallet,
  Calendar as CalendarIcon,
  Tag,
  User,
  Car,
  Info,
  Banknote,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { RentalFleet } from "@shared/schema";

const memberNames = ["Mahesh", "Shalini", "Siluni", "Ralini", "Beta Je", "Other"];
const incomeCategories = ["Salary", "Vehicle Rent", "Bookkeeping", "Forex", "Other"];
const expenseCategories = [
  "Groceries/Snacks", "School Fees", "Class Fees", "Transport/Petrol", "Exam Fees",
  "Medical", "Beauty/salon", "Electricity", "Water", "Internet/Phones", "Gas",
  "Entertainment", "Popi/Tabi", "Lunch/Dinner", "Clothings", "Servant",
  "Books/Stationary", "Loan/Lease", "Interest", "Licence/Insurance", "Tyre/Battery",
  "Vehicle Repair", "Sundry",
];

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  date: z.string(),
  category: z.string().min(1, "Please select a category"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  source: z.string().optional(),
  member: z.string().default("Mahesh"),
  isBusiness: z.boolean().default(false),
  vehicleId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      category: "",
      amount: "",
      description: "",
      source: "",
      member: "Mahesh",
      isBusiness: false,
    },
  });

  const { data: fleetData = [] } = useQuery<RentalFleet[]>({
    queryKey: ["/api/rental-fleet"],
  });

  const transactionType = form.watch("type");
  const isBusiness = form.watch("isBusiness");
  const categories = transactionType === "income" ? incomeCategories : expenseCategories;

  const createIncomeMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/income", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      toast({ title: "Success", description: "Income added successfully" });
      setOpen(false);
      form.reset();
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense added successfully" });
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: FormValues) => {
    const { type, source, ...rest } = data;
    const transactionData = {
      ...rest,
      date: new Date(data.date).toISOString(),
      amount: data.amount,
      member: data.member || "Other",
      isBusiness: data.isBusiness,
      vehicleId: data.isBusiness ? data.vehicleId : null,
    };

    if (type === "income") {
      createIncomeMutation.mutate({ ...transactionData, source: source || "Other" });
    } else {
      createExpenseMutation.mutate(transactionData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 rounded-xl px-4 sm:px-6 transition-all active:scale-95 border-none">
          <Plus className="mr-2 h-5 w-5" />
          Add Transaction
        </Button>
      </DialogTrigger>

      {/* Responsive Dialog: Full width on mobile, max-w on desktop */}
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 border-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-2xl rounded-2xl">
        <div className={cn("sticky top-0 h-1.5 w-full z-10", transactionType === "income" ? "bg-emerald-500" : "bg-rose-500")} />

        <DialogHeader className="px-6 sm:px-8 pt-6 sm:pt-8">
          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", transactionType === "income" ? "bg-emerald-500/10" : "bg-rose-500/10")}>
              <Wallet className={cn("h-5 w-5 sm:h-6 sm:w-6", transactionType === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")} />
            </div>
            New Transaction
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6 px-6 sm:px-8 pb-8 sm:pb-10 pt-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <Tabs onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-white/5 h-12">
                      <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold flex gap-2">
                        <ArrowUpCircle className="h-4 w-4" /> Income
                      </TabsTrigger>
                      <TabsTrigger value="expense" className="rounded-lg data-[state=active]:bg-rose-600 data-[state=active]:text-white font-bold flex gap-2">
                        <ArrowDownCircle className="h-4 w-4" /> Expense
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormItem>
              )}
            />

            {/* Grid change: 1 col on mobile, 2 col on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3" /> Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 focus:border-emerald-500 h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <Banknote className="h-3 w-3" /> Amount
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" step="0.01" placeholder="0.00" {...field} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 focus:border-emerald-500 h-11 rounded-xl font-bold text-lg pl-9" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">Rs.</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <Tag className="h-3 w-3" /> Category
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 h-11 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="member"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <User className="h-3 w-3" /> Member
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10">
                        {memberNames.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-4">
              <FormField
                control={form.control}
                name="isBusiness"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-bold text-slate-700 dark:text-slate-200">Business Units</FormLabel>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Mark for Car Rent / Forex</p>
                    </div>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-6 w-6 rounded-md border-slate-300 dark:border-white/20 data-[state=checked]:bg-blue-600" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isBusiness && (
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem className="pt-3 border-t border-slate-200 dark:border-white/5">
                      <FormLabel className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest flex items-center gap-2">
                        <Car className="h-3 w-3" /> Select Vehicle
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 h-10 rounded-lg">
                            <SelectValue placeholder="Which vehicle?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10">
                          {fleetData.map((v) => (
                            <SelectItem key={v.id} value={v.id.toString()}>
                              {v.make} {v.model} ({v.licensePlate})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                    <Info className="h-3 w-3" /> Remarks
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add details here..." className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 min-h-[80px] rounded-xl focus:border-emerald-500" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Buttons: Stacked on mobile, side-by-side on desktop */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full sm:flex-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl h-12 font-bold">
                Discard
              </Button>
              <Button
                type="submit"
                disabled={createIncomeMutation.isPending || createExpenseMutation.isPending}
                className={cn(
                  "w-full sm:flex-[2] rounded-xl h-12 font-black shadow-xl transition-all active:scale-95 border-none",
                  transactionType === "income"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white",
                )}
              >
                {createIncomeMutation.isPending || createExpenseMutation.isPending ? "Syncing..." : "Confirm Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}