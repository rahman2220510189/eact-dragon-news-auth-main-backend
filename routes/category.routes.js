const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");

// Category routes — get and manage news categories
module.exports = (categoriesCollection) => {
  const router = express.Router();

  // GET /api/categories — get all categories
  router.get("/", async (req, res) => {
    try {
      const categories = await categoriesCollection
        .find()
        .sort({ name: 1 })
        .toArray();
      res.json({ categories });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // POST /api/categories — add new category (logged-in users)
  router.post("/", verifyToken, async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      // Check if category already exists
      const existing = await categoriesCollection.findOne({ name });
      if (existing) {
        return res.status(400).json({ message: "Category already exists" });
      }

      const result = await categoriesCollection.insertOne({
        name,
        createdAt: new Date(),
      });

      res.status(201).json({ message: "Category created", id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  // GET /api/categories/:id — get single category by id
router.get("/:id", async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const category = await categoriesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

  return router;
};