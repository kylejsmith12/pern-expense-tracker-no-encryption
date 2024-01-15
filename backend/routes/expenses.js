const pool = require("../db");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();

// Create expenses table if not exists
const createExpensesTable = async () => {
  try {
    const result = await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount NUMERIC NOT NULL,
        category VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        receipt BYTEA,
        notes TEXT,
        user_id INTEGER
      )
    `);

    console.log("Expenses table is ready");
  } catch (error) {
    console.error("Error creating expenses table:", error);
  }
};

// Call the function to create the expenses table
createExpensesTable();

// Add an expense
router.post("/", upload.none(), async (req, res) => {
  console.log("req: ", req);
  const { amount, category, date, notes, user_id } = req.body;
  const receipt = req.file ? req.file.buffer : null;
  // Assuming you have user information in the request
  // const userId = req.user ? req.user.userId : null;

  try {
    const result = await pool.query(
      "INSERT INTO expenses (amount, category, date, receipt, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [amount, category, date, receipt, notes, user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Define a route to get expense data
router.get("/", async (req, res) => {
  const userId = req.query.user_id;

  try {
    const result = await pool.query(
      "SELECT * FROM expenses WHERE user_id = $1",
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching expenses data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete an expense by ID
router.delete("/:id", async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user ? req.query.user_id : null;

  try {
    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *",
      [expenseId, userId]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ message: "Expense deleted successfully" });
    } else {
      res.status(404).json({ error: "Expense not found" });
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete all expenses
router.delete("/", async (req, res) => {
  const userId = req.user ? req.user.userId : null;

  try {
    const result = await pool.query(
      "DELETE FROM expenses WHERE user_id = $1 RETURNING *",
      [userId]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ message: "All expenses deleted successfully" });
    } else {
      res.status(404).json({ error: "No expenses found" });
    }
  } catch (error) {
    console.error("Error deleting all expenses:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
