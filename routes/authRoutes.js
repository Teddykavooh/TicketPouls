const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Route for user registration
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the users table
    const insertUserQuery = `
      INSERT INTO users (email, password, role)
      VALUES (?, ?, ?)
    `;
    await db.query(insertUserQuery, [email, hashedPassword, role]);

    console.log("User registered successfully");
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// Route for user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const getUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(getUserQuery, [email], async (err, result) => {
    if (err) {
      //   console.error("Error logging in:", err);
      res.status(500).json({ error: "Error logging in" });
    } else {
      if (result[0].length === 0) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      //   console.log("User:", result);
      //   console.log("User details", password, result[0].password);

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(
        password,
        result[0].password,
      );
      // console.log("User details");
      //   console.log("Pass: ", password, result[0].password);

      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Generate a JWT token for authentication
      const genToken = jwt.sign(
        { email: result[0].email, role: result[0].admin_role },
        "TicketPouls",
      );

      // console.log("User logged in successfully", genToken);
      res
        .status(200)
        .json({ message: "User logged in successfully", token: genToken });
    }
  });
});

module.exports = router;
