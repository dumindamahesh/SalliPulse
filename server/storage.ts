import {
  income,
  expenses,
  assets,
  liabilities,
  investments,
  rentalFleet,
  forex,
  tradingAccounts,
  recurringBills,
  billPayments,
  type Income,
  type Expense,
  type Asset,
  type Liability,
  type Investment,
  type RentalFleet,
  type Forex,
  type TradingAccount,
  type RecurringBill,
  type BillPayment,
  type InsertIncome,
  type InsertExpense,
  type InsertAsset,
  type InsertLiability,
  type InsertInvestment,
  type InsertRentalFleet,
  type InsertForex,
  type InsertTradingAccount,
  type InsertRecurringBill,
  type InsertBillPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Income operations
  getAllIncome(): Promise<Income[]>;
  getIncomeById(id: string): Promise<Income | undefined>;
  createIncome(data: InsertIncome): Promise<Income>;
  updateIncome(id: string, data: Partial<InsertIncome>): Promise<Income>;
  deleteIncome(id: string): Promise<void>;

  // Expense operations
  getAllExpenses(): Promise<Expense[]>;
  getExpenseById(id: string): Promise<Expense | undefined>;
  createExpense(data: InsertExpense): Promise<Expense>;
  updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  // Asset operations
  getAllAssets(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;
  createAsset(data: InsertAsset): Promise<Asset>;
  updateAsset(id: string, data: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;

  // Liability operations
  getAllLiabilities(): Promise<Liability[]>;
  getLiabilityById(id: string): Promise<Liability | undefined>;
  createLiability(data: InsertLiability): Promise<Liability>;
  updateLiability(id: string, data: Partial<InsertLiability>): Promise<Liability>;
  deleteLiability(id: string): Promise<void>;

  // Investment operations
  getAllInvestments(): Promise<Investment[]>;
  getInvestmentById(id: string): Promise<Investment | undefined>;
  createInvestment(data: InsertInvestment): Promise<Investment>;
  updateInvestment(id: string, data: Partial<InsertInvestment>): Promise<Investment>;
  deleteInvestment(id: string): Promise<void>;

  // Rental Fleet operations
  getAllRentalFleet(): Promise<RentalFleet[]>;
  getRentalFleetById(id: string): Promise<RentalFleet | undefined>;
  createRentalFleet(data: InsertRentalFleet): Promise<RentalFleet>;
  updateRentalFleet(id: string, data: Partial<InsertRentalFleet>): Promise<RentalFleet>;
  deleteRentalFleet(id: string): Promise<void>;

  // Forex operations
  getAllForex(): Promise<Forex[]>;
  getForexById(id: string): Promise<Forex | undefined>;
  createForex(data: InsertForex): Promise<Forex>;
  updateForex(id: string, data: Partial<InsertForex>): Promise<Forex>;
  deleteForex(id: string): Promise<void>;

  // Trading Account operations
  getAllTradingAccounts(): Promise<TradingAccount[]>;
  createTradingAccount(data: InsertTradingAccount): Promise<TradingAccount>;
  updateTradingAccount(id: string, data: Partial<InsertTradingAccount>): Promise<TradingAccount>;
  deleteTradingAccount(id: string): Promise<void>;

  // Recurring Bill operations
  getAllRecurringBills(): Promise<RecurringBill[]>;
  getRecurringBillById(id: string): Promise<RecurringBill | undefined>;
  createRecurringBill(data: InsertRecurringBill): Promise<RecurringBill>;
  updateRecurringBill(id: string, data: Partial<InsertRecurringBill>): Promise<RecurringBill>;
  deleteRecurringBill(id: string): Promise<void>;

  // Bill Payment operations
  getAllBillPayments(billId?: string): Promise<BillPayment[]>;
  getBillPaymentById(id: string): Promise<BillPayment | undefined>;
  createBillPayment(data: InsertBillPayment): Promise<BillPayment>;
  updateBillPayment(id: string, data: Partial<InsertBillPayment>): Promise<BillPayment>;
  deleteBillPayment(id: string): Promise<void>;
}

// In-memory storage implementation
class MemStorage implements IStorage {
  private incomeMap: Map<string, Income> = new Map();
  private expenseMap: Map<string, Expense> = new Map();
  private assetMap: Map<string, Asset> = new Map();
  private liabilityMap: Map<string, Liability> = new Map();
  private investmentMap: Map<string, Investment> = new Map();
  private fleetMap: Map<string, RentalFleet> = new Map();

  async getAllIncome(): Promise<Income[]> { return Array.from(this.incomeMap.values()); }
  async getIncomeById(id: string): Promise<Income | undefined> { return this.incomeMap.get(id); }
  async createIncome(data: InsertIncome): Promise<Income> {
    const id = Math.random().toString(36).substr(2, 9);
    const dateStr = typeof data.date === 'string' ? data.date : (data.date as any).toISOString();
    const item = { ...data, id, date: dateStr } as unknown as Income;
    this.incomeMap.set(id, item);
    return item;
  }
  async updateIncome(id: string, data: Partial<InsertIncome>): Promise<Income> {
    const item = this.incomeMap.get(id)!;
    const updated = { ...item, ...data } as Income;
    this.incomeMap.set(id, updated);
    return updated;
  }
  async deleteIncome(id: string): Promise<void> { this.incomeMap.delete(id); }

  async getAllExpenses(): Promise<Expense[]> { return Array.from(this.expenseMap.values()); }
  async getExpenseById(id: string): Promise<Expense | undefined> { return this.expenseMap.get(id); }
  async createExpense(data: InsertExpense): Promise<Expense> {
    const id = Math.random().toString(36).substr(2, 9);
    const dateStr = typeof data.date === 'string' ? data.date : (data.date as any).toISOString();
    const item = { ...data, id, date: dateStr } as unknown as Expense;
    this.expenseMap.set(id, item);
    return item;
  }
  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense> {
    const item = this.expenseMap.get(id)!;
    const updated = { ...item, ...data } as Expense;
    this.expenseMap.set(id, updated);
    return updated;
  }
  async deleteExpense(id: string): Promise<void> { this.expenseMap.delete(id); }

  async getAllAssets(): Promise<Asset[]> { return Array.from(this.assetMap.values()); }
  async getAssetById(id: string): Promise<Asset | undefined> { return this.assetMap.get(id); }
  async createAsset(data: InsertAsset): Promise<Asset> {
    const id = Math.random().toString(36).substr(2, 9);
    const item = { ...data, id } as Asset;
    this.assetMap.set(id, item);
    return item;
  }
  async updateAsset(id: string, data: Partial<InsertAsset>): Promise<Asset> {
    const item = this.assetMap.get(id)!;
    const updated = { ...item, ...data } as Asset;
    this.assetMap.set(id, updated);
    return updated;
  }
  async deleteAsset(id: string): Promise<void> { this.assetMap.delete(id); }

  async getAllLiabilities(): Promise<Liability[]> { return Array.from(this.liabilityMap.values()); }
  async getLiabilityById(id: string): Promise<Liability | undefined> { return this.liabilityMap.get(id); }
  async createLiability(data: InsertLiability): Promise<Liability> {
    const id = Math.random().toString(36).substr(2, 9);
    const item = { ...data, id } as Liability;
    this.liabilityMap.set(id, item);
    return item;
  }
  async updateLiability(id: string, data: Partial<InsertLiability>): Promise<Liability> {
    const item = this.liabilityMap.get(id)!;
    const updated = { ...item, ...data } as Liability;
    this.liabilityMap.set(id, updated);
    return updated;
  }
  async deleteLiability(id: string): Promise<void> { this.liabilityMap.delete(id); }

  async getAllInvestments(): Promise<Investment[]> { return Array.from(this.investmentMap.values()); }
  async getInvestmentById(id: string): Promise<Investment | undefined> { return this.investmentMap.get(id); }
  async createInvestment(data: InsertInvestment): Promise<Investment> {
    const id = Math.random().toString(36).substr(2, 9);
    const item = { ...data, id } as Investment;
    this.investmentMap.set(id, item);
    return item;
  }
  async updateInvestment(id: string, data: Partial<InsertInvestment>): Promise<Investment> {
    const item = this.investmentMap.get(id)!;
    const updated = { ...item, ...data } as Investment;
    this.investmentMap.set(id, updated);
    return updated;
  }
  async deleteInvestment(id: string): Promise<void> { this.investmentMap.delete(id); }

  async getAllRentalFleet(): Promise<RentalFleet[]> { return Array.from(this.fleetMap.values()); }
  async getRentalFleetById(id: string): Promise<RentalFleet | undefined> { return this.fleetMap.get(id); }
  async createRentalFleet(data: InsertRentalFleet): Promise<RentalFleet> {
    const id = Math.random().toString(36).substr(2, 9);
    const item = { ...data, id } as RentalFleet;
    this.fleetMap.set(id, item);
    return item;
  }
  async updateRentalFleet(id: string, data: Partial<InsertRentalFleet>): Promise<RentalFleet> {
    const item = this.fleetMap.get(id)!;
    const updated = { ...item, ...data } as RentalFleet;
    this.fleetMap.set(id, updated);
    return updated;
  }
  async deleteRentalFleet(id: string): Promise<void> { this.fleetMap.delete(id); }

  private forexMap: Map<string, Forex> = new Map();
  async getAllForex(): Promise<Forex[]> { return Array.from(this.forexMap.values()); }
  async getForexById(id: string): Promise<Forex | undefined> { return this.forexMap.get(id); }
  async createForex(data: InsertForex): Promise<Forex> {
    const id = Math.random().toString(36).substr(2, 9);
    const dateStr = typeof data.date === 'string' ? data.date : (data.date as any).toISOString();
    const item = { ...data, id, date: dateStr } as unknown as Forex;
    this.forexMap.set(id, item);
    return item;
  }
  async updateForex(id: string, data: Partial<InsertForex>): Promise<Forex> {
    const item = this.forexMap.get(id)!;
    const updated = { ...item, ...data } as Forex;
    this.forexMap.set(id, updated);
    return updated;
  }
  private accountMap: Map<string, TradingAccount> = new Map();

  async getAllTradingAccounts(): Promise<TradingAccount[]> { return Array.from(this.accountMap.values()); }
  async createTradingAccount(data: InsertTradingAccount): Promise<TradingAccount> {
    const id = generateId();
    const item = { ...data, id } as TradingAccount;
    this.accountMap.set(id, item);
    return item;
  }
  async updateTradingAccount(id: string, data: Partial<InsertTradingAccount>): Promise<TradingAccount> {
    const item = this.accountMap.get(id)!;
    const updated = { ...item, ...data } as TradingAccount;
    this.accountMap.set(id, updated);
    return updated;
  }
  async deleteTradingAccount(id: string): Promise<void> { this.accountMap.delete(id); }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function formatDate(date: Date | string): string {
  if (typeof date === 'string') return date;
  return date.toISOString();
}

export class DatabaseStorage implements IStorage {
  // Income operations
  async getAllIncome(): Promise<Income[]> {
    return await db.select().from(income);
  }

  async getIncomeById(id: string): Promise<Income | undefined> {
    const [result] = await db.select().from(income).where(eq(income.id, id));
    return result;
  }

  async createIncome(data: InsertIncome): Promise<Income> {
    const id = generateId();
    const incomeData = {
      ...data,
      id,
      date: formatDate(data.date),
    };
    await db.insert(income).values(incomeData);
    const [result] = await db.select().from(income).where(eq(income.id, id));
    return result!;
  }

  async updateIncome(id: string, data: Partial<InsertIncome>): Promise<Income> {
    const updateData: any = { ...data };
    if (updateData.date) {
      updateData.date = formatDate(updateData.date);
    }
    await db.update(income).set(updateData).where(eq(income.id, id));
    const [result] = await db.select().from(income).where(eq(income.id, id));
    return result!;
  }

  async deleteIncome(id: string): Promise<void> {
    await db.delete(income).where(eq(income.id, id));
  }

  // Expense operations
  async getAllExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses);
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    const [result] = await db.select().from(expenses).where(eq(expenses.id, id));
    return result;
  }

  async createExpense(data: InsertExpense): Promise<Expense> {
    const id = generateId();
    const expenseData = {
      ...data,
      id,
      date: formatDate(data.date),
    };
    await db.insert(expenses).values(expenseData);
    const [result] = await db.select().from(expenses).where(eq(expenses.id, id));
    return result!;
  }

  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense> {
    const updateData: any = { ...data };
    if (updateData.date) {
      updateData.date = formatDate(updateData.date);
    }
    await db.update(expenses).set(updateData).where(eq(expenses.id, id));
    const [result] = await db.select().from(expenses).where(eq(expenses.id, id));
    return result!;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // Asset operations
  async getAllAssets(): Promise<Asset[]> {
    return await db.select().from(assets);
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const [result] = await db.select().from(assets).where(eq(assets.id, id));
    return result;
  }

  async createAsset(data: InsertAsset): Promise<Asset> {
    const id = generateId();
    const assetData = { ...data, id };
    await db.insert(assets).values(assetData);
    const [result] = await db.select().from(assets).where(eq(assets.id, id));
    return result!;
  }

  async updateAsset(id: string, data: Partial<InsertAsset>): Promise<Asset> {
    await db.update(assets).set(data).where(eq(assets.id, id));
    const [result] = await db.select().from(assets).where(eq(assets.id, id));
    return result!;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  // Liability operations
  async getAllLiabilities(): Promise<Liability[]> {
    return await db.select().from(liabilities);
  }

  async getLiabilityById(id: string): Promise<Liability | undefined> {
    const [result] = await db.select().from(liabilities).where(eq(liabilities.id, id));
    return result;
  }

  async createLiability(data: InsertLiability): Promise<Liability> {
    const id = generateId();
    const liabilityData = { ...data, id };
    await db.insert(liabilities).values(liabilityData);
    const [result] = await db.select().from(liabilities).where(eq(liabilities.id, id));
    return result!;
  }

  async updateLiability(id: string, data: Partial<InsertLiability>): Promise<Liability> {
    await db.update(liabilities).set(data).where(eq(liabilities.id, id));
    const [result] = await db.select().from(liabilities).where(eq(liabilities.id, id));
    return result!;
  }

  async deleteLiability(id: string): Promise<void> {
    await db.delete(liabilities).where(eq(liabilities.id, id));
  }

  // Investment operations
  async getAllInvestments(): Promise<Investment[]> {
    return await db.select().from(investments);
  }

  async getInvestmentById(id: string): Promise<Investment | undefined> {
    const [result] = await db.select().from(investments).where(eq(investments.id, id));
    return result;
  }

  async createInvestment(data: InsertInvestment): Promise<Investment> {
    const id = generateId();
    const investmentData = { ...data, id };
    await db.insert(investments).values(investmentData);
    const [result] = await db.select().from(investments).where(eq(investments.id, id));
    return result!;
  }

  async updateInvestment(id: string, data: Partial<InsertInvestment>): Promise<Investment> {
    await db.update(investments).set(data).where(eq(investments.id, id));
    const [result] = await db.select().from(investments).where(eq(investments.id, id));
    return result!;
  }

  async deleteInvestment(id: string): Promise<void> {
    await db.delete(investments).where(eq(investments.id, id));
  }

  // Rental Fleet operations
  async getAllRentalFleet(): Promise<RentalFleet[]> {
    return await db.select().from(rentalFleet);
  }

  async getRentalFleetById(id: string): Promise<RentalFleet | undefined> {
    const [result] = await db.select().from(rentalFleet).where(eq(rentalFleet.id, id));
    return result;
  }

  async createRentalFleet(data: InsertRentalFleet): Promise<RentalFleet> {
    const id = generateId();
    const fleetData = { ...data, id };
    await db.insert(rentalFleet).values(fleetData);
    const [result] = await db.select().from(rentalFleet).where(eq(rentalFleet.id, id));
    return result!;
  }

  async updateRentalFleet(id: string, data: Partial<InsertRentalFleet>): Promise<RentalFleet> {
    await db.update(rentalFleet).set(data).where(eq(rentalFleet.id, id));
    const [result] = await db.select().from(rentalFleet).where(eq(rentalFleet.id, id));
    return result!;
  }

  async deleteRentalFleet(id: string): Promise<void> {
    await db.delete(rentalFleet).where(eq(rentalFleet.id, id));
  }

  // Forex operations
  async getAllForex(): Promise<Forex[]> {
    return await db.select().from(forex);
  }

  async getForexById(id: string): Promise<Forex | undefined> {
    const [result] = await db.select().from(forex).where(eq(forex.id, id));
    return result;
  }

  async createForex(data: InsertForex): Promise<Forex> {
    const id = generateId();
    const forexData = {
      ...data,
      id,
      date: formatDate(data.date),
    };
    await db.insert(forex).values(forexData);
    const [result] = await db.select().from(forex).where(eq(forex.id, id));
    return result!;
  }

  async updateForex(id: string, data: Partial<InsertForex>): Promise<Forex> {
    const updateData: any = { ...data };
    if (updateData.date) {
      updateData.date = formatDate(updateData.date);
    }
    await db.update(forex).set(updateData).where(eq(forex.id, id));
    const [result] = await db.select().from(forex).where(eq(forex.id, id));
    return result!;
  }

  async deleteForex(id: string): Promise<void> {
    await db.delete(forex).where(eq(forex.id, id));
  }

  // Trading Account operations
  async getAllTradingAccounts(): Promise<TradingAccount[]> {
    return await db.select().from(tradingAccounts);
  }

  async createTradingAccount(data: InsertTradingAccount): Promise<TradingAccount> {
    const id = generateId();
    const accountData = { ...data, id };
    await db.insert(tradingAccounts).values(accountData);
    const [result] = await db.select().from(tradingAccounts).where(eq(tradingAccounts.id, id));
    return result!;
  }

  async updateTradingAccount(id: string, data: Partial<InsertTradingAccount>): Promise<TradingAccount> {
    await db.update(tradingAccounts).set(data).where(eq(tradingAccounts.id, id));
    const [result] = await db.select().from(tradingAccounts).where(eq(tradingAccounts.id, id));
    return result!;
  }

  async deleteTradingAccount(id: string): Promise<void> {
    await db.delete(tradingAccounts).where(eq(tradingAccounts.id, id));
  }

  // Recurring Bill operations
  async getAllRecurringBills(): Promise<RecurringBill[]> {
    return await db.select().from(recurringBills);
  }

  async getRecurringBillById(id: string): Promise<RecurringBill | undefined> {
    const [result] = await db.select().from(recurringBills).where(eq(recurringBills.id, id));
    return result;
  }

  async createRecurringBill(data: InsertRecurringBill): Promise<RecurringBill> {
    const id = generateId();
    const billData = { ...data, id };
    await db.insert(recurringBills).values(billData);
    const [result] = await db.select().from(recurringBills).where(eq(recurringBills.id, id));
    return result!;
  }

  async updateRecurringBill(id: string, data: Partial<InsertRecurringBill>): Promise<RecurringBill> {
    await db.update(recurringBills).set(data).where(eq(recurringBills.id, id));
    const [result] = await db.select().from(recurringBills).where(eq(recurringBills.id, id));
    return result!;
  }

  async deleteRecurringBill(id: string): Promise<void> {
    await db.delete(recurringBills).where(eq(recurringBills.id, id));
  }

  // Bill Payment operations
  async getAllBillPayments(billId?: string): Promise<BillPayment[]> {
    if (billId) {
      return await db.select().from(billPayments).where(eq(billPayments.billId, billId));
    }
    return await db.select().from(billPayments);
  }

  async getBillPaymentById(id: string): Promise<BillPayment | undefined> {
    const [result] = await db.select().from(billPayments).where(eq(billPayments.id, id));
    return result;
  }

  async createBillPayment(data: InsertBillPayment): Promise<BillPayment> {
    const id = generateId();
    let expenseId: string | null = null;

    // Get the bill to check if it's a payable
    const bill = await this.getRecurringBillById(data.billId);

    if (bill && bill.type === 'payable') {
      // Automatically create an expense
      const expense = await this.createExpense({
        date: data.date,
        category: bill.category,
        amount: data.amount,
        description: `${bill.name} - ${data.notes || 'Bill payment'}`,
        member: bill.member,
        isBusiness: false,
      });
      expenseId = expense.id;
    }

    const paymentData = {
      ...data,
      id,
      date: formatDate(data.date),
      expenseId,
    };

    await db.insert(billPayments).values(paymentData);
    const [result] = await db.select().from(billPayments).where(eq(billPayments.id, id));
    return result!;
  }

  async updateBillPayment(id: string, data: Partial<InsertBillPayment>): Promise<BillPayment> {
    const updateData: any = { ...data };
    if (updateData.date) {
      updateData.date = formatDate(updateData.date);
    }
    await db.update(billPayments).set(updateData).where(eq(billPayments.id, id));
    const [result] = await db.select().from(billPayments).where(eq(billPayments.id, id));
    return result!;
  }

  async deleteBillPayment(id: string): Promise<void> {
    // Get the payment first to check if it has a linked expense
    const payment = await this.getBillPaymentById(id);

    if (payment && payment.expenseId) {
      // Delete the linked expense
      await this.deleteExpense(payment.expenseId);
    }

    await db.delete(billPayments).where(eq(billPayments.id, id));
  }
}

// Use SQLite database storage for persistent data (no authentication needed)
export const storage = new DatabaseStorage();
