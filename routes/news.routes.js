const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");

// News routes — CRUD for news articles
module.exports = (newsCollection, usersCollection) => {
  const router = express.Router();

  // GET /api/news — get all news (with optional category filter)
  router.get("/", async (req, res) => {
    try {
      const { category, page = 1, limit = 10 } = req.query;
      const filter = category ? { category } : {};
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const news = await newsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      const total = await newsCollection.countDocuments(filter);
      res.json({ news, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // GET /api/news/my-posts — MUST be before /:id route
  router.get("/my-posts", verifyToken, async (req, res) => {
    try {
      // Find all news posted by logged-in user
      const news = await newsCollection
        .find({ "author.id": new ObjectId(req.user.id) })
        .sort({ createdAt: -1 })
        .toArray();

      res.json({ news });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // GET /api/news/:id — get single news by id
  router.get("/:id", async (req, res) => {
    try {
      const news = await newsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      // Increment view count
      await newsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $inc: { views: 1 } }
      );

      res.json({ news });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // POST /api/news — create new news (any logged-in user)
  router.post("/", verifyToken, async (req, res) => {
    try {
      const { title, content, category, thumbnail } = req.body;

      if (!title || !content || !category) {
        return res.status(400).json({ message: "Title, content and category are required" });
      }

      // Get author info from token
      const author = await usersCollection.findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { password: 0 } }
      );

      const newNews = {
        title,
        content,
        category,
        thumbnail: thumbnail || "",
        author: {
          id: author._id,
          name: author.name,
          photo: author.photo,
          email: author.email,
        },
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await newsCollection.insertOne(newNews);
      res.status(201).json({ message: "News created", id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // PATCH /api/news/:id — update news (only author)
  router.patch("/:id", verifyToken, async (req, res) => {
    try {
      const { title, content, category, thumbnail } = req.body;

      const news = await newsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      // Only author can edit their own news
      if (news.author.id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden — not your news" });
      }

      await newsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { title, content, category, thumbnail, updatedAt: new Date() } }
      );

      res.json({ message: "News updated" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // DELETE /api/news/:id — delete news (only author)
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const news = await newsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      // Only author can delete their own news
      if (news.author.id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden — not your news" });
      }

      await newsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ message: "News deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
};