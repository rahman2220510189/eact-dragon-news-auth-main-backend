// server/makeAdmin.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjuyyb2.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1 } });

async function makeAdmin() {
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  // Replace with your email
  const result = await db.collection("users").updateOne(
    { email: "fahmida@gmail.com" },
    { $set: { role: "admin" } }
  );
  console.log("Done:", result.modifiedCount, "user updated");
  await client.close();
}

makeAdmin();