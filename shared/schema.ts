import { sql } from "drizzle-orm";
import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const income = sqliteTable("income", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  amount: text("amount").notNull(),
  source: text("source").notNull(),
  description: text("description"),
  member: text("member").notNull().default("Other"),
  isBusiness: integer("is_business", { mode: 'boolean' }).notNull().default(false),
  vehicleId: text("vehicle_id"),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  amount: text("amount").notNull(),
  description: text("description").notNull(),
  member: text("member").notNull().default("Other"),
  isBusiness: integer("is_business", { mode: 'boolean' }).notNull().default(false),
  vehicleId: text("vehicle_id"),
});

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  currentValue: text("current_value").notNull(),
  description: text("description"),
  isBusiness: integer("is_business", { mode: 'boolean' }).notNull().default(false),
});

export const liabilities = sqliteTable("liabilities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: text("amount").notNull(),
  description: text("description"),
  isBusiness: integer("is_business", { mode: 'boolean' }).notNull().default(false),
});

export const investments = sqliteTable("investments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: text("quantity").notNull(),
  currentValue: text("current_value").notNull(),
  description: text("description"),
});

export const rentalFleet = sqliteTable("rental_fleet", {
  id: text("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  licensePlate: text("license_plate").notNull(),
  purchasePrice: text("purchase_price").notNull(),
  currentValue: text("current_value").notNull(),
  dailyRate: text("daily_rate").notNull(),
  status: text("status").notNull().default("available"),
  notes: text("notes"),
  licenseDueDate: text("license_due_date"),
  insuranceDueDate: text("insurance_due_date"),
});

export const forex = sqliteTable("forex", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  currencyPair: text("currency_pair").notNull(),
  amount: text("amount").notNull(),
  entryPrice: text("entry_price").notNull(),
  exitPrice: text("exit_price").notNull(),
  profit: text("profit").notNull(),
  status: text("status").notNull().default("completed"),
  member: text("member").notNull().default("Other"),
  notes: text("notes"),
});

export const insertIncomeSchema = createInsertSchema(income).omit({ id: true }).extend({
  date: z.coerce.date(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true }).extend({
  date: z.coerce.date(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({ id: true });
export const insertLiabilitySchema = createInsertSchema(liabilities).omit({ id: true });
export const insertInvestmentSchema = createInsertSchema(investments).omit({ id: true });
export const insertRentalFleetSchema = createInsertSchema(rentalFleet).omit({ id: true });
export const insertForexSchema = createInsertSchema(forex).omit({ id: true }).extend({
  date: z.coerce.date(),
});

export type Income = typeof income.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Liability = typeof liabilities.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type RentalFleet = typeof rentalFleet.$inferSelect;
export type Forex = typeof forex.$inferSelect;

export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type InsertLiability = z.infer<typeof insertLiabilitySchema>;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type InsertRentalFleet = z.infer<typeof insertRentalFleetSchema>;
export const tradingAccounts = sqliteTable("trading_accounts", {
  id: text("id").primaryKey(),
  brokerName: text("broker_name").notNull(),
  accountType: text("account_type").notNull(), // 'funded' or 'real'
  fundedCompanyName: text("funded_company_name"),
  accountCapacity: text("account_capacity").notNull(), // in USD
  status: text("status").notNull().default("active"),
  notes: text("notes"),
});

export const insertTradingAccountSchema = createInsertSchema(tradingAccounts).omit({ id: true });
export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type InsertTradingAccount = z.infer<typeof insertTradingAccountSchema>;
