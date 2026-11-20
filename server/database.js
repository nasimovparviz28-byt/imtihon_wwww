import 'dotenv/config';
import mongoose from 'mongoose';

let connectionPromise;

export async function connectToMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI sozlanmagan. Vercel Environment Variables ichiga qo‘shing.');

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}
