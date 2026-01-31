import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { resolve } from 'path';
import * as schema from "@shared/schema";

const dbPath = resolve('./finance.db');
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

// Initialize database tables
function initializeDb() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS income (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      source TEXT NOT NULL,
      description TEXT,
      member TEXT NOT NULL DEFAULT 'Other',
      is_business INTEGER NOT NULL DEFAULT 0,
      vehicle_id TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      description TEXT NOT NULL,
      member TEXT NOT NULL DEFAULT 'Other',
      is_business INTEGER NOT NULL DEFAULT 0,
      vehicle_id TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      current_value TEXT NOT NULL,
      description TEXT,
      is_business INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS liabilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      description TEXT,
      is_business INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS investments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity TEXT NOT NULL,
      current_value TEXT NOT NULL,
      description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS rental_fleet (
      id TEXT PRIMARY KEY,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year TEXT NOT NULL,
      license_plate TEXT NOT NULL,
      purchase_price TEXT NOT NULL,
      current_value TEXT NOT NULL,
      daily_rate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      notes TEXT,
      license_due_date TEXT,
      insurance_due_date TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS recurring_bills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly',
      next_due_date TEXT,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      member TEXT NOT NULL DEFAULT 'Other'
    )`,
    `CREATE TABLE IF NOT EXISTS bill_payments (
      id TEXT PRIMARY KEY,
      bill_id TEXT NOT NULL,
      date TEXT NOT NULL,
      amount TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid',
      expense_id TEXT,
      notes TEXT
    )`
  ];

  for (const table of tables) {
    sqlite.exec(table);
  }
}

initializeDb();

export const db = drizzle({ client: sqlite, schema });
