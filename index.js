const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjuyyb2.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB Connected ");

    // Database reference
    const db = client.db(process.env.DB_NAME);

    // Collections
    // const usersCollection = db.collection("users");
    // const newsCollection = db.collection("news");
    // const categoriesCollection = db.collection("categories");
    // const commentsCollection = db.collection("comments");

    // // Import routes — pass collections so routes can use them
    // const authRoutes = require("./routes/auth.routes")(usersCollection);
    // const newsRoutes = require("./routes/news.routes")(newsCollection, usersCollection);
    // const categoryRoutes = require("./routes/category.routes")(categoriesCollection);
    // const commentRoutes = require("./routes/comment.routes")(commentsCollection, usersCollection);

    // // Use routes
    // app.use("/api/auth", authRoutes);
    // app.use("/api/news", newsRoutes);
    // app.use("/api/categories", categoryRoutes);
    // app.use("/api/comments", commentRoutes);

    // Health check route
    app.get("/", (req, res) => {
      res.json({ message: "News Portal API running " });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.log("MongoDB Error:", error.message);
  }
}

run().catch(console.dir);