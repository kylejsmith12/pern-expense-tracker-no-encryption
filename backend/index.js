const express = require("express");
const cors = require("cors");
const app = express();

// Load environment variables
require("dotenv").config();

// Include API routes
const expensesRoutes = require("./routes/expenses");
const usersRoutes = require("./routes/users");

const allowedOrigins = [
  "http://localhost:5173",
  "http://pern-expense-tracker-s3.s3-website.us-east-2.amazonaws.com",
];

// Use middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.use(express.json()); // Parse JSON requests

// Use API routes
app.use("/expenses", expensesRoutes);
app.use("/users", usersRoutes);

// Default route
app.get("/", (req, res) => {
  return res.send(`
      <br />
      <br />
      <center>
          <h1>
              Hello from AWS EC2
          </h1>
      </center>
  `);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
