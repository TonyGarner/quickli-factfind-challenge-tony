import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { connectToDatabase } from './mongodb';
import mongoose from 'mongoose';

// Note: In a real app you'd import the client from better-auth/react or next
// For Pages Router we expose the auth instance and handle session via API

let authInstance: ReturnType<typeof betterAuth> | null = null;

export async function getAuth() {
  if (authInstance) return authInstance;

  await connectToDatabase();

  // Use the mongoose connection's db
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('MongoDB connection not established');
  }

  authInstance = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // demo only
    },
    // Add more providers or social later if needed
    trustedOrigins: ['http://localhost:3000'],
    // You can add advanced config: rate limiting, etc.
  });

  return authInstance;
}

// Helper to get session from request (used in API routes / getServerSideProps)
export async function getSessionFromRequest(req: any) {
  const auth = await getAuth();
  // Better Auth provides a way to get session from headers/cookies
  // For simplicity in this demo we use a lightweight approach in middleware or API
  return auth.api.getSession({
    headers: req.headers,
  });
}
