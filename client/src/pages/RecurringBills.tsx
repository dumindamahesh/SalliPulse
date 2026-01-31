import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Receipt,
    Plus,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar as CalendarIcon,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
} from "lucide-react";
import type { RecurringBill, BillPayment } from "@shared/schema";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

// Shared constants from expenses page
const MEMBER_NAMES = ["Mahesh", "Shalini", "Siluni", "Ralini", "Beta Je", "Other"];
const INCOME_CATEGORIES = ["Salary", "Vehicle Rent", "Bookkeeping", "Forex", "Other"];
const EXPENSE_CATEGORIES = [
    "Groceries/Snacks", "School Fees", "Class Fees", "Transport/Petrol", "Exam Fees",
    "Medical", "Beauty/salon", "Electricity", "Water", "Internet/Phones", "Gas",
    "Entertainment", "Popi/Tabi", "Lunch/Dinner", "Clothings", "Servant",
    "Books/Stationary", "Loan/Lease", "Interest", "Licence/Insurance", "Tyre/Battery",
    "Vehicle Repair", "Sundry",
];

const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
];

export default function RecurringBillsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filterType, setFilterType] = useState<string>("all");
    const [isAddBillOpen, setIsAddBillOpen] = useState(false);
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<RecurringBill | null>(null);

    // Fetch recurring bills
    const { data: billsData = [], isLoading: billsLoading } = useQuery<RecurringBill[]>({
        queryKey: ["/api/recurring-bills"],
    });

    // Fetch bill payments
    const { data: paymentsData = [], isLoading: paymentsLoading } = useQuery<BillPayment[]>({
        queryKey: ["/api/bill-payments"],
    });

    const filteredBills = useMemo(() => {
        if (filterType === "all") return billsData;
        return billsData.filter((bill) => bill.type === filterType);
    }, [billsData, filterType]);

    const activePayables = filteredBills.filter(
        (b) => b.type === "payable" && b.isActive
    );
    const activeReceivables = filteredBills.filter(
        (b) => b.type === "receivable" && b.isActive
    );

    const totalPayables = activePayables.reduce(
        (sum, bill) => sum + parseFloat(bill.amount),
        0
    );
    const totalReceivables = activeReceivables.reduce(
        (sum, bill) => sum + parseFloat(bill.amount),
        0
    );

    const categoryBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        activePayables.forEach((bill) => {
            const current = map.get(bill.category) || 0;
            map.set(bill.category, current + parseFloat(bill.amount));
        });
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [activePayables]);

    const formatCurrency = (val: any) =>
        `Rs. ${Number(val).toLocaleString("en-US")}`;

    if (billsLoading || paymentsLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient-purple-cyan">Recurring Bills</h1>
                    <p className="text-muted-foreground">
                        Track your monthly bills and payments
                    </p>
                </div>
                <AddBillDialog
                    isOpen={isAddBillOpen}
                    onOpenChange={setIsAddBillOpen}
                    bill={selectedBill}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/recurring-bills"] });
                        setSelectedBill(null);
                    }}
                />
            </div>

            {/* Premium KPI Cards with Gradients */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Monthly Payables - Red/Orange Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-orange-red p-[1px] card-hover">
                    <div className="glass-card h-full rounded-2xl p-6 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-red-500/20 ring-1 ring-red-500/30">
                                <TrendingDown className="h-6 w-6 text-red-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                                    Monthly Payables
                                </p>
                            </div>
                        </div>
                        <div className="text-4xl font-bold tabular-nums text-white">
                            Rs. {totalPayables.toLocaleString()}
                        </div>
                        <p className="text-xs text-red-200/70 mt-2">
                            {activePayables.length} active bills
                        </p>
                    </div>
                </div>

                {/* Monthly Receivables - Green/Emerald Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-green-emerald p-[1px] card-hover">
                    <div className="glass-card h-full rounded-2xl p-6 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                                <TrendingUp className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                    Monthly Receivables
                                </p>
                            </div>
                        </div>
                        <div className="text-4xl font-bold tabular-nums text-white">
                            Rs. {totalReceivables.toLocaleString()}
                        </div>
                        <p className="text-xs text-emerald-200/70 mt-2">
                            {activeReceivables.length} active income sources
                        </p>
                    </div>
                </div>

                {/* Net Cash Flow - Blue/Cyan Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-blue-teal p-[1px] card-hover">
                    <div className="glass-card h-full rounded-2xl p-6 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30">
                                <DollarSign className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Net Cash Flow
                                </p>
                            </div>
                        </div>
                        <div className="text-4xl font-bold tabular-nums text-white">
                            Rs. {(totalReceivables - totalPayables).toLocaleString()}
                        </div>
                        <p className="text-xs text-blue-200/70 mt-2">Per month</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Payable Categories Chart */}
                <Card className="glass-card border-white/5 card-hover">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-purple-400">
                            Payable Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {categoryBreakdown.length > 0 ? (
                                    <PieChart>
                                        <Pie
                                            data={categoryBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={90}
                                            innerRadius={65}
                                            stroke="none"
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {categoryBreakdown.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    className="animate-glow-pulse"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                background: 'rgba(15, 23, 42, 0.9)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '12px',
                                                backdropFilter: 'blur(12px)'
                                            }}
                                        />
                                        <Legend
                                            layout="horizontal"
                                            verticalAlign="bottom"
                                            align="center"
                                            wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }}
                                        />
                                    </PieChart>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        No payables yet
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card className="glass-card border-white/5 card-hover">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                            Recent Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {paymentsData.length > 0 ? (
                                paymentsData.slice(0, 5).map((payment, idx) => {
                                    const bill = billsData.find((b) => b.id === payment.billId);
                                    return (
                                        <div
                                            key={payment.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:border-purple-500/30 hover:bg-slate-800/60 transition-all"
                                            style={{ animationDelay: `${idx * 0.1}s` }}
                                        >
                                            <div className="p-2 rounded-lg bg-purple-500/20 ring-1 ring-purple-500/30">
                                                {bill?.type === 'payable' ? (
                                                    <TrendingDown className="h-4 w-4 text-red-400" />
                                                ) : (
                                                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{bill?.name || "Unknown"}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(payment.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">
                                                    Rs. {parseFloat(payment.amount).toLocaleString()}
                                                </p>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                                    No payments recorded yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Your Bills</h2>
                    <div className="flex gap-4">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bills</SelectItem>
                                <SelectItem value="payable">Payables Only</SelectItem>
                                <SelectItem value="receivable">Receivables Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBills.map((bill) => (
                        <BillCard
                            key={bill.id}
                            bill={bill}
                            onEdit={() => {
                                setSelectedBill(bill);
                                setIsAddBillOpen(true);
                            }}
                            onRecordPayment={() => {
                                setSelectedBill(bill);
                                setIsRecordPaymentOpen(true);
                            }}
                            onDelete={async () => {
                                try {
                                    await fetch(`/api/recurring-bills/${bill.id}`, {
                                        method: "DELETE",
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["/api/recurring-bills"] });
                                    toast({
                                        title: "Bill deleted",
                                        description: "The recurring bill has been deleted.",
                                    });
                                } catch (error) {
                                    toast({
                                        title: "Error",
                                        description: "Failed to delete bill",
                                        variant: "destructive",
                                    });
                                }
                            }}
                        />
                    ))}
                </div>

                {filteredBills.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No bills yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by adding your first recurring bill
                        </p>
                        <Button onClick={() => setIsAddBillOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Bill
                        </Button>
                    </div>
                )}
            </div>

            <RecordPaymentDialog
                isOpen={isRecordPaymentOpen}
                onOpenChange={setIsRecordPaymentOpen}
                bill={selectedBill}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/bill-payments"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
                    setSelectedBill(null);
                }}
            />
        </div>
    );
}

// Bill Card Component
function BillCard({
    bill,
    onEdit,
    onRecordPayment,
    onDelete,
}: {
    bill: RecurringBill;
    onEdit: () => void;
    onRecordPayment: () => void;
    onDelete: () => void;
}) {
    const borderColor = bill.type === "payable" ? "border-t-red-500/60" : "border-t-emerald-500/60";
    const badgeClass = bill.type === "payable" ? "badge-payable" : "badge-receivable";

    return (
        <div className={`glass-card border-t-4 ${borderColor} card-hover transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10`}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-bold">{bill.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                                {bill.category}
                            </span>
                            <span>•</span>
                            <span>{bill.member}</span>
                        </p>
                    </div>
                    <span className={badgeClass}>
                        {bill.type}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <p className="text-3xl font-bold tabular-nums bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Rs. {parseFloat(bill.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground/70">per {bill.frequency}</p>
                </div>

                {bill.nextDueDate && (
                    <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-slate-800/40 border border-white/5">
                        <CalendarIcon className="h-4 w-4 text-blue-400" />
                        <span className="text-xs">
                            Next: {new Date(bill.nextDueDate).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {bill.description && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-2 italic">
                        {bill.description}
                    </p>
                )}

                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        className="flex-1 bg-gradient-purple-cyan hover:opacity-90 text-white border-none shadow-lg shadow-purple-500/20"
                        onClick={onRecordPayment}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Payment
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-slate-800/60 hover:text-blue-400"
                        onClick={onEdit}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-red-500/20 hover:text-red-400"
                        onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </div>
    );
}

// Add/Edit Bill Dialog
function AddBillDialog({
    isOpen,
    onOpenChange,
    bill,
    onSuccess,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    bill: RecurringBill | null;
    onSuccess: () => void;
}) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        type: "payable",
        category: "",
        amount: "",
        frequency: "monthly",
        billDate: new Date().toISOString().split("T")[0],
        nextDueDate: "",
        description: "",
        member: "Mahesh",
    });

    // Update form when bill changes
    useState(() => {
        if (bill) {
            setFormData({
                name: bill.name,
                type: bill.type,
                category: bill.category,
                amount: bill.amount,
                frequency: bill.frequency,
                billDate: new Date().toISOString().split("T")[0],
                nextDueDate: bill.nextDueDate || "",
                description: bill.description || "",
                member: bill.member,
            });
        } else {
            setFormData({
                name: "",
                type: "payable",
                category: "",
                amount: "",
                frequency: "monthly",
                billDate: new Date().toISOString().split("T")[0],
                nextDueDate: "",
                description: "",
                member: "Mahesh",
            });
        }
    });

    const categories = formData.type === "receivable" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = bill
                ? `/api/recurring-bills/${bill.id}`
                : "/api/recurring-bills";
            const method = bill ? "PATCH" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            toast({
                title: bill ? "Bill updated" : "Bill created",
                description: `${formData.name} has been ${bill ? "updated" : "added"}.`,
            });

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save bill",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bill
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{bill ? "Edit" : "Add New"} Recurring Bill</DialogTitle>
                    <DialogDescription>
                        Set up a recurring bill or income source
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Bill Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g., Electricity Bill"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) =>
                                setFormData({ ...formData, type: value, category: "" })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payable">Payable (Expense)</SelectItem>
                                <SelectItem value="receivable">Receivable (Income)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="amount">Amount (Rs.)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: e.target.value })
                                }
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                                value={formData.frequency}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, frequency: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="billDate">Bill Date</Label>
                        <Input
                            id="billDate"
                            type="date"
                            value={formData.billDate}
                            onChange={(e) =>
                                setFormData({ ...formData, billDate: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="nextDueDate">Next Due Date (Optional)</Label>
                        <Input
                            id="nextDueDate"
                            type="date"
                            value={formData.nextDueDate}
                            onChange={(e) =>
                                setFormData({ ...formData, nextDueDate: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="member">Member</Label>
                        <Select
                            value={formData.member}
                            onValueChange={(value) =>
                                setFormData({ ...formData, member: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MEMBER_NAMES.map((member) => (
                                    <SelectItem key={member} value={member}>
                                        {member}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Additional notes..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">{bill ? "Update" : "Create"} Bill</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Record Payment Dialog
function RecordPaymentDialog({
    isOpen,
    onOpenChange,
    bill,
    onSuccess,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    bill: RecurringBill | null;
    onSuccess: () => void;
}) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        status: "paid",
        notes: "",
    });

    // Update amount when bill changes
    useState(() => {
        if (bill) {
            setFormData((prev) => ({
                ...prev,
                amount: bill.amount,
            }));
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bill) return;

        try {
            await fetch("/api/bill-payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    billId: bill.id,
                    ...formData,
                }),
            });

            toast({
                title: "Payment recorded",
                description: `Payment for ${bill.name} has been recorded.${bill.type === "payable" ? " An expense entry was automatically created." : ""
                    }`,
            });

            onSuccess();
            onOpenChange(false);

            // Reset form
            setFormData({
                date: new Date().toISOString().split("T")[0],
                amount: "",
                status: "paid",
                notes: "",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record payment",
                variant: "destructive",
            });
        }
    };

    if (!bill) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Record a payment for {bill.name}
                        {bill.type === "payable" &&
                            " (This will automatically create an expense entry)"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="payment-date">Payment Date</Label>
                        <Input
                            id="payment-date"
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="payment-amount">Amount Paid (Rs.)</Label>
                        <Input
                            id="payment-amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) =>
                                setFormData({ ...formData, amount: e.target.value })
                            }
                            placeholder="0.00"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Expected: Rs. {parseFloat(bill.amount).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="payment-status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) =>
                                setFormData({ ...formData, status: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="payment-notes">Notes (Optional)</Label>
                        <Textarea
                            id="payment-notes"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            placeholder="Additional payment details..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Record Payment</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
