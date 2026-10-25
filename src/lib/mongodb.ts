import mongoose from "mongoose";

const DIRECT_URI =
  "mongodb://althafnizam763_db_user:Fk3GilZO9JbkLcsF@ac-eg5jkqk-shard-00-00.at589pu.mongodb.net:27017,ac-eg5jkqk-shard-00-01.at589pu.mongodb.net:27017,ac-eg5jkqk-shard-00-02.at589pu.mongodb.net:27017/zenith_academy?ssl=true&replicaSet=atlas-h3ff4s-shard-0&authSource=admin&retryWrites=true&w=majority";

const MONGODB_URI = process.env.MONGODB_URI || DIRECT_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || "zenith_academy",
      serverSelectionTimeoutMS: 15000,
    };

    const attemptConnect = async (uri: string) => {
      return mongoose.connect(uri, opts);
    };

    cached!.promise = (async () => {
      try {
        const m = await attemptConnect(MONGODB_URI);
        console.log("Connected to MongoDB successfully");
        return m;
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (
          error?.code === "ECONNREFUSED" ||
          error?.message?.includes("querySrv")
        ) {
          console.warn("Retrying MongoDB connection with direct replica set URI...");
          const m = await attemptConnect(DIRECT_URI);
          console.log("Connected to MongoDB via direct replica set successfully");
          return m;
        }
        throw err;
      }
    })();
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    console.error("MongoDB connection failed:", e);
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
