import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "teachus";

const clientPromise = uri
  ? (global._mongoClientPromise ?? new MongoClient(uri).connect().catch((err) => {
      console.error("Failed to connect to MongoDB", err);
      throw err;
    }))
  : null;

if (uri && clientPromise && !global._mongoClientPromise) {
  global._mongoClientPromise = clientPromise;
}

export async function getDb(): Promise<Db> {
  if (!uri || !clientPromise) {
    throw new Error(
      "Please set the MONGODB_URI environment variable in your .env.local file."
    );
  }
  const client = await clientPromise;
  return client.db(dbName);
}

