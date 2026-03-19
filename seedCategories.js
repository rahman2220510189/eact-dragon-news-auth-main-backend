const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjuyyb2.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// All categories from the original news portal
const categories = [
  { name: "Breaking News" },
  { name: "Regular News" },
  { name: "International News" },
  { name: "Sports" },
  { name: "Entertainment" },
  { name: "Culture" },
  { name: "Arts" },
  { name: "All News" },
].map((cat) => ({ ...cat, createdAt: new Date() }));

async function seedCategories() {
  try {
    await client.connect();
    console.log("MongoDB Connected ");

    const db = client.db(process.env.DB_NAME);
    const categoriesCollection = db.collection("categories");

    // Clear existing categories first
    await categoriesCollection.deleteMany({});
    console.log("Old categories cleared ");

    // Insert all categories
    const result = await categoriesCollection.insertMany(categories);
    console.log(`${result.insertedCount} categories inserted `);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

seedCategories();