import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  varchar,
  decimal,
  timestamp,
  boolean,
} from "drizzle-orm/sqlite"; // Changed import for SQLite
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Note: Generate UUIDs in your application code before inserting

export const income = sqliteTable("income", {
  id: varchar("id").primaryKey(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  source: text("source").notNull(),
  description: text("description"),
  isBusiness: boolean("is_business").notNull().default(false),
});

export const expenses = sqliteTable("expenses", {
  id: varchar("id").primaryKey(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  isBusiness: boolean("is_business").notNull().default(false),
});

export const assets = sqliteTable("assets", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  isBusiness: boolean("is_business").notNull().default(false),
});

export const liabilities = sqliteTable("liabilities", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  isBusiness: boolean("is_business").notNull().default(false),
});

export const investments = sqliteTable("investments", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 4 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
});

export const rentalFleet = sqliteTable("rental_fleet", {
  id: varchar("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  licensePlate: text("license_plate").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  dailyRate: decimal("daily_rate", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("available"),
  notes: text("notes"),
});

// Schemas for inserting data, with UUIDs generated in your app
export const insertIncomeSchema = createInsertSchema(income)
  .omit({ id: true })
  .extend({
    id: z.string().uuid(), // Expect UUID to be generated in app before insert
    date: z.coerce.date(),
  });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true })
  .extend({
    id: z.string().uuid(),
    date: z.coerce.date(),
  });

export const insertAssetSchema = createInsertSchema(assets).omit({ id: true });
export const insertLiabilitySchema = createInsertSchema(liabilities).omit({ id: true });
export const insertInvestmentSchema = createInsertSchema(investments).omit({ id: true });
export const insertRentalFleetSchema = createInsertSchema(rentalFleet).omit({ id: true });

// Type definitions
export type Income = typeof income.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Liability = typeof liabilities.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type RentalFleet = typeof rentalFleet.$inferSelect;

export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type InsertLiability = z.infer<typeof insertLiabilitySchema>;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type InsertRentalFleet = z.infer<typeof insertRentalFleetSchema>;
