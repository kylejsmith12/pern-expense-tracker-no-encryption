const express = require("express");
const pool = require("../db");

const router = express.Router();

// Register user
router.post("/register", async (req, res) => {
  console.log("req.body: ", req);
  const { username, email, password, first_name, last_name } = req.body;

  try {
    // Check if the username or email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      // Username or email already exists
      return res.status(400).json({ error: "Username or email already taken" });
    }

    // Insert user into the database
    const result = await pool.query(
      "INSERT INTO users (username, email, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, email, password, first_name, last_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user from the database
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // For simplicity, let's assume the password is stored as plain text.
    // In a production environment, use a secure password hashing mechanism.

    // Compare passwords (plaintext comparison for simplicity)
    if (password === user.password) {
      res.status(200).json({ user: user });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error in user login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
