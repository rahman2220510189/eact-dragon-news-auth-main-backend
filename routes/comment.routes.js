const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");

// Comment routes — add and get comments for news
module.exports = (commentsCollection, usersCollection) => {
  const router = express.Router();

  // GET /api/comments/:newsId — get all comments for a news
  router.get("/:newsId", async (req, res) => {
    try {
      const comments = await commentsCollection
        .find({ newsId: req.params.newsId })
        .sort({ createdAt: -1 })
        .toArray();

      res.json({ comments });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // POST /api/comments — add a comment (logged-in users only)
  router.post("/", verifyToken, async (req, res) => {
    try {
      const { newsId, text } = req.body;

      if (!newsId || !text) {
        return res.status(400).json({ message: "newsId and text are required" });
      }

      // Get commenter info
      const user = await usersCollection.findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { password: 0 } }
      );

      const comment = {
        newsId,
        text,
        author: {
          id: user._id,
          name: user.name,
          photo: user.photo,
        },
        createdAt: new Date(),
      };

      const result = await commentsCollection.insertOne(comment);
      res.status(201).json({ message: "Comment added", id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // DELETE /api/comments/:id — delete comment (only author)
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const comment = await commentsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Only comment author can delete
      if (comment.author.id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden — not your comment" });
      }

      await commentsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ message: "Comment deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
};