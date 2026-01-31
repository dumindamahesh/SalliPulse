
import Database from 'better-sqlite3';
const db = new Database('./finance.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", tables);

tables.forEach((t: any) => {
    try {
        const count = db.prepare(`SELECT count(*) as count FROM ${t.name}`).get() as any;
        console.log(`Table ${t.name}: ${count.count} rows`);
        if (count.count > 0) {
            const rows = db.prepare(`SELECT * FROM ${t.name} LIMIT 1`).all();
            console.log(`Sample data from ${t.name}:`, rows);
        }
    } catch (e) {
        console.error(`Error reading ${t.name}:`, e);
    }
});
