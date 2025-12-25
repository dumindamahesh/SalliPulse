import {
  income,
  expenses,
  assets,
  liabilities,
  investments,
  rentalFleet,
  type Income,
  type Expense,
  type Asset,
  type Liability,
  type Investment,
  type RentalFleet,
  type InsertIncome,
  type InsertExpense,
  type InsertAsset,
  type InsertLiability,
  type InsertInvestment,
  type InsertRentalFleet,
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
    const item = { ...data, id, date: new Date(data.date) } as Income;
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
    const item = { ...data, id, date: new Date(data.date) } as Expense;
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
    const [result] = await db.insert(income).values(data).returning();
    return result;
  }

  async updateIncome(id: string, data: Partial<InsertIncome>): Promise<Income> {
    const [result] = await db.update(income).set(data).where(eq(income.id, id)).returning();
    return result;
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
    const [result] = await db.insert(expenses).values(data).returning();
    return result;
  }

  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense> {
    const [result] = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning();
    return result;
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
    const [result] = await db.insert(assets).values(data).returning();
    return result;
  }

  async updateAsset(id: string, data: Partial<InsertAsset>): Promise<Asset> {
    const [result] = await db.update(assets).set(data).where(eq(assets.id, id)).returning();
    return result;
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
    const [result] = await db.insert(liabilities).values(data).returning();
    return result;
  }

  async updateLiability(id: string, data: Partial<InsertLiability>): Promise<Liability> {
    const [result] = await db.update(liabilities).set(data).where(eq(liabilities.id, id)).returning();
    return result;
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
    const [result] = await db.insert(investments).values(data).returning();
    return result;
  }

  async updateInvestment(id: string, data: Partial<InsertInvestment>): Promise<Investment> {
    const [result] = await db.update(investments).set(data).where(eq(investments.id, id)).returning();
    return result;
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
    const [result] = await db.insert(rentalFleet).values(data).returning();
    return result;
  }

  async updateRentalFleet(id: string, data: Partial<InsertRentalFleet>): Promise<RentalFleet> {
    const [result] = await db.update(rentalFleet).set(data).where(eq(rentalFleet.id, id)).returning();
    return result;
  }

  async deleteRentalFleet(id: string): Promise<void> {
    await db.delete(rentalFleet).where(eq(rentalFleet.id, id));
  }
}

// Use in-memory storage temporarily due to database authentication issues
// Switch back to DatabaseStorage once database is properly configured
export const storage = new MemStorage();
