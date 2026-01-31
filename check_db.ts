import Database from 'better-sqlite3';
const db = new Database('./finance.db');

console.log("=== Checking Income Dates ===");
const income = db.prepare("SELECT id, date, category, amount, source FROM income ORDER BY date DESC LIMIT 10").all();
income.forEach((row: any) => {
    console.log(`Date: ${row.date}, Amount: ${row.amount}, Source: ${row.source}`);
});

console.log("\n=== Checking Expense Dates ===");
const expenses = db.prepare("SELECT id, date, category, amount, description FROM expenses ORDER BY date DESC LIMIT 10").all();
expenses.forEach((row: any) => {
    console.log(`Date: ${row.date}, Amount: ${row.amount}, Category: ${row.category}`);
});

db.close();
