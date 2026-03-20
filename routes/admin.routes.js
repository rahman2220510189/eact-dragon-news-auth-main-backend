const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");

// Admin routes — only accessible by admin users
module.exports = (usersCollection, newsCollection, categoriesCollection, commentsCollection) => {
  const router = express.Router();

  // Middleware — verify admin role for all admin routes
  const verifyAdmin = async (req, res, next) => {
    try {
      const user = await usersCollection.findOne({
        _id: new ObjectId(req.user.id),
      });
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden — admins only" });
      }
      next();
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

  // GET /api/admin/stats — dashboard statistics
  router.get("/stats", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const [totalUsers, totalNews, totalComments, totalCategories] =
        await Promise.all([
          usersCollection.countDocuments(),
          newsCollection.countDocuments(),
          commentsCollection.countDocuments(),
          categoriesCollection.countDocuments(),
        ]);

      res.json({ totalUsers, totalNews, totalComments, totalCategories });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // GET /api/admin/users — get all users
  router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const users = await usersCollection
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ users });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // PATCH /api/admin/users/:id/role — make user admin or remove admin
  router.patch("/users/:id/role", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const { role } = req.body;

      if (!["admin", "user"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      await usersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { role } }
      );

      res.json({ message: `User role updated to ${role}` });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // DELETE /api/admin/users/:id — delete a user
  router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
      await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // GET /api/admin/news — get all news for admin
  router.get("/news", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const news = await newsCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ news });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // DELETE /api/admin/news/:id — admin can delete any news
  router.delete("/news/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
      await newsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ message: "News deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // PATCH /api/admin/news/:id — admin can edit any news
  router.patch("/news/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const { title, content, category, thumbnail } = req.body;

      await newsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { title, content, category, thumbnail, updatedAt: new Date() } }
      );

      res.json({ message: "News updated" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // DELETE /api/admin/categories/:id — delete a category
  router.delete("/categories/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
      await categoriesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ message: "Category deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
};