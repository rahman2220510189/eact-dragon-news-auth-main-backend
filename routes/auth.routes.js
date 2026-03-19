const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

// Auth routes — register, login, get current user
module.exports = (usersCollection) => {
  const router = express.Router();

  // POST /api/auth/register — create new user
  router.post("/register", async (req, res) => {
    try {
      const { name, email, password, photo } = req.body;

      // Check if email already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Build user object
      const newUser = {
        name,
        email,
        password: hashedPassword,
        photo: photo || "",
        role: "user",
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);

      // Generate JWT token
      const token = jwt.sign(
        { id: result.insertedId, email, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: result.insertedId,
          name,
          email,
          photo: photo || "",
          role: "user",
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // POST /api/auth/login — login existing user
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Compare password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          photo: user.photo,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // GET /api/auth/me — get current logged-in user info
  router.get("/me", verifyToken, async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const user = await usersCollection.findOne(
        { _id: new ObjectId(req.user.id) },
        // Exclude password from response
        { projection: { password: 0 } }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // PATCH /api/auth/update — update user profile
  router.patch("/update", verifyToken, async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const { name, photo } = req.body;

      // Update only name and photo
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(req.user.id) },
        { $set: { name, photo, updatedAt: new Date() } }
      );

      res.json({ message: "Profile updated", result });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
};