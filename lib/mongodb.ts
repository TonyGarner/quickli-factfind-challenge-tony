import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  var _mongoMemoryServer: MongoMemoryServer | undefined;
  var _mongooseConnection: typeof mongoose | undefined;
}

let mongoServer: MongoMemoryServer | undefined = global._mongoMemoryServer;
let isConnected = false;

export async function connectToDatabase() {
  // If already connected and ready, return early
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (MONGODB_URI) {
    // Production / persistent MongoDB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB');
    return;
  }

  // === Demo mode: mongodb-memory-server ===
  console.log('⚠️ No MONGODB_URI found — using mongodb-memory-server');

  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create({
      instance: { dbName: 'quickli_factfind_demo' },
    });
    global._mongoMemoryServer = mongoServer; // persist across hot reloads
  }

  const uri = mongoServer.getUri();

  // Prevent multiple connects with different URIs
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log('✅ Connected to in-memory MongoDB (mongodb-memory-server)');
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = undefined;
    global._mongoMemoryServer = undefined;
  }
  isConnected = false;
}