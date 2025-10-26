import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertIncomeSchema,
  insertExpenseSchema,
  insertAssetSchema,
  insertLiabilitySchema,
  insertInvestmentSchema,
  insertRentalFleetSchema,
} from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up multer for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // Excel import route
  app.post("/api/import/excel", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const results = { income: 0, expenses: 0, errors: [] as string[] };

      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        for (const row of data as any[]) {
          try {
            // Try to detect if it's income or expense based on common column patterns
            const hasAmount = row.Amount || row.amount;
            const hasDate = row.Date || row.date;
            const hasCategory = row.Category || row.category;
            const hasDescription = row.Description || row.description;

            if (!hasAmount || !hasDate) {
              continue; // Skip rows without essential data
            }

            const amount = parseFloat(String(hasAmount).replace(/[$,]/g, ""));
            let date: Date;

            // Parse date
            if (typeof hasDate === "number") {
              // Excel date number - convert to JS date
              const excelEpoch = new Date(1899, 11, 30);
              date = new Date(excelEpoch.getTime() + hasDate * 86400000);
            } else {
              date = new Date(hasDate);
            }

            // Determine if it's income or expense
            const isIncome = amount > 0 || 
                           sheetName.toLowerCase().includes("income") ||
                           (row.Type && row.Type.toLowerCase().includes("income"));

            if (isIncome) {
              const incomeData = {
                date: date,
                amount: String(Math.abs(amount)),
                category: hasCategory || "Other",
                source: row.Source || row.source || "Import",
                description: hasDescription || "",
                isBusiness: false,
              };
              await storage.createIncome(incomeData);
              results.income++;
            } else {
              const expenseData = {
                date: date,
                amount: String(Math.abs(amount)),
                category: hasCategory || "Other",
                description: hasDescription || "Imported expense",
                isBusiness: false,
              };
              await storage.createExpense(expenseData);
              results.expenses++;
            }
          } catch (error: any) {
            results.errors.push(`Row error: ${error.message}`);
          }
        }
      }

      res.json({
        success: true,
        imported: {
          income: results.income,
          expenses: results.expenses,
        },
        errors: results.errors,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to import file: " + error.message });
    }
  });

  // Income routes
  app.get("/api/income", async (req, res) => {
    try {
      const income = await storage.getAllIncome();
      res.json(income);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income" });
    }
  });

  app.get("/api/income/:id", async (req, res) => {
    try {
      const income = await storage.getIncomeById(req.params.id);
      if (!income) {
        return res.status(404).json({ error: "Income not found" });
      }
      res.json(income);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income" });
    }
  });

  app.post("/api/income", async (req, res) => {
    try {
      const validatedData = insertIncomeSchema.parse(req.body);
      const income = await storage.createIncome(validatedData);
      res.status(201).json(income);
    } catch (error) {
      res.status(400).json({ error: "Invalid income data" });
    }
  });

  app.patch("/api/income/:id", async (req, res) => {
    try {
      const income = await storage.updateIncome(req.params.id, req.body);
      res.json(income);
    } catch (error) {
      res.status(400).json({ error: "Failed to update income" });
    }
  });

  app.delete("/api/income/:id", async (req, res) => {
    try {
      await storage.deleteIncome(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpenseById(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.updateExpense(req.params.id, req.body);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      await storage.deleteExpense(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Asset routes
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getAllAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.getAssetById(req.params.id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      res.status(400).json({ error: "Invalid asset data" });
    }
  });

  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.updateAsset(req.params.id, req.body);
      res.json(asset);
    } catch (error) {
      res.status(400).json({ error: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      await storage.deleteAsset(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete asset" });
    }
  });

  // Liability routes
  app.get("/api/liabilities", async (req, res) => {
    try {
      const liabilities = await storage.getAllLiabilities();
      res.json(liabilities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liabilities" });
    }
  });

  app.get("/api/liabilities/:id", async (req, res) => {
    try {
      const liability = await storage.getLiabilityById(req.params.id);
      if (!liability) {
        return res.status(404).json({ error: "Liability not found" });
      }
      res.json(liability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liability" });
    }
  });

  app.post("/api/liabilities", async (req, res) => {
    try {
      const validatedData = insertLiabilitySchema.parse(req.body);
      const liability = await storage.createLiability(validatedData);
      res.status(201).json(liability);
    } catch (error) {
      res.status(400).json({ error: "Invalid liability data" });
    }
  });

  app.patch("/api/liabilities/:id", async (req, res) => {
    try {
      const liability = await storage.updateLiability(req.params.id, req.body);
      res.json(liability);
    } catch (error) {
      res.status(400).json({ error: "Failed to update liability" });
    }
  });

  app.delete("/api/liabilities/:id", async (req, res) => {
    try {
      await storage.deleteLiability(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete liability" });
    }
  });

  // Investment routes
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getAllInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.get("/api/investments/:id", async (req, res) => {
    try {
      const investment = await storage.getInvestmentById(req.params.id);
      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
      }
      res.json(investment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investment" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const validatedData = insertInvestmentSchema.parse(req.body);
      const investment = await storage.createInvestment(validatedData);
      res.status(201).json(investment);
    } catch (error) {
      res.status(400).json({ error: "Invalid investment data" });
    }
  });

  app.patch("/api/investments/:id", async (req, res) => {
    try {
      const investment = await storage.updateInvestment(req.params.id, req.body);
      res.json(investment);
    } catch (error) {
      res.status(400).json({ error: "Failed to update investment" });
    }
  });

  app.delete("/api/investments/:id", async (req, res) => {
    try {
      await storage.deleteInvestment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete investment" });
    }
  });

  // Rental Fleet routes
  app.get("/api/rental-fleet", async (req, res) => {
    try {
      const fleet = await storage.getAllRentalFleet();
      res.json(fleet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rental fleet" });
    }
  });

  app.get("/api/rental-fleet/:id", async (req, res) => {
    try {
      const vehicle = await storage.getRentalFleetById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/rental-fleet", async (req, res) => {
    try {
      const validatedData = insertRentalFleetSchema.parse(req.body);
      const vehicle = await storage.createRentalFleet(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.patch("/api/rental-fleet/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateRentalFleet(req.params.id, req.body);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Failed to update vehicle" });
    }
  });

  app.delete("/api/rental-fleet/:id", async (req, res) => {
    try {
      await storage.deleteRentalFleet(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
